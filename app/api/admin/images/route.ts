import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { productImages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sku, firebaseUrl } = await req.json();
  if (!sku || !firebaseUrl) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await db
    .insert(productImages)
    .values({ sku, firebaseUrl })
    .onConflictDoUpdate({
      target: productImages.sku,
      set: { firebaseUrl, updatedAt: new Date() },
    });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sku } = await req.json();
  if (!sku) {
    return NextResponse.json({ error: "Missing sku" }, { status: 400 });
  }

  await db.delete(productImages).where(eq(productImages.sku, sku));

  return NextResponse.json({ ok: true });
}
