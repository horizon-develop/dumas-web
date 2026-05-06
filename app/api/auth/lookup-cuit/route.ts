import { NextRequest, NextResponse } from "next/server";
import { sistelGet } from "@/lib/sistel";
import type { SistelCliente } from "@/lib/sistel";

function formatCuit(raw: string): string {
  const d = raw.replace(/\D/g, "");
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`;
}

export async function GET(req: NextRequest) {
  const cuit = req.nextUrl.searchParams.get("cuit") ?? "";
  const digits = cuit.replace(/\D/g, "");

  if (digits.length !== 11) {
    return NextResponse.json({ found: false });
  }

  try {
    const res = await sistelGet<SistelCliente>(
      "clientes",
      { CUIT: formatCuit(digits) },
      { nocache: true }
    );
    const client = res.data[0];
    if (!client) return NextResponse.json({ found: false });

    return NextResponse.json({
      found: true,
      name: client.RazonSocial ?? "",
      email: client.Email ?? "",
    });
  } catch {
    return NextResponse.json({ found: false });
  }
}
