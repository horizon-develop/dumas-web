import { NextRequest, NextResponse } from "next/server";
import { sistelGetPaginated, SistelArticulo } from "@/lib/sistel";
import { db } from "@/lib/db";
import { productImages } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const params: Record<string, string> = {};
  for (const key of ["page", "limit", "q", "rubro", "marca", "subrubro"]) {
    const val = searchParams.get(key);
    if (val) params[key] = val;
  }

  const sistelRes = await sistelGetPaginated<SistelArticulo>("productos", params);

  const skus = sistelRes.data.map((p) => p.Codigo).filter(Boolean);
  const images =
    skus.length > 0
      ? await db
          .select()
          .from(productImages)
          .where(inArray(productImages.sku, skus))
      : [];

  const imageMap = Object.fromEntries(images.map((img) => [img.sku, img.firebaseUrl]));

  return NextResponse.json({
    data: sistelRes.data.map((p) => ({ ...p, imageUrl: imageMap[p.Codigo] ?? null })),
    pagination: sistelRes.pagination,
  });
}
