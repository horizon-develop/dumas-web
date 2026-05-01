import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sistelGet } from "@/lib/sistel";
import type { SistelCliente } from "@/lib/sistel";

function normalizeCuit(cuit: string): string {
  return cuit.replace(/\D/g, "");
}

const PLACEHOLDER_CUIT = "00000000000";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, taxId } = await req.json();

    if (!name?.trim() || !email?.trim() || !password || !taxId?.trim()) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedTaxId = normalizeCuit(taxId);

    if (normalizedTaxId.length !== 11) {
      return NextResponse.json({ error: "CUIT inválido: debe tener 11 dígitos" }, { status: 400 });
    }

    const [existing] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 });
    }

    let sistelId: number | null = null;
    try {
      const res = await sistelGet<SistelCliente>("clientes", { q: normalizedTaxId, limit: "20" });
      const match = res.data.find((c) => {
        const cuitNorm = normalizeCuit(c.CUIT);
        if (cuitNorm === PLACEHOLDER_CUIT) return false;
        if (cuitNorm === normalizedTaxId) return true;
        if (c.Email && c.Email.toLowerCase() === normalizedEmail) return true;
        return false;
      });
      if (match) sistelId = match.ID;
    } catch {
      // Sistel unreachable — create account without linking
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.insert(users).values({
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
      role: "CLIENT",
      status: "PENDING",
      taxId: normalizedTaxId,
      sistelId,
    });

    return NextResponse.json({ ok: true, linked: sistelId !== null });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
