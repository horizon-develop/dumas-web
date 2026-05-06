import { notFound } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiPackage, FiTag, FiLayers } from "react-icons/fi";
import { sistelGetPaginated, SistelArticulo } from "@/lib/sistel";
import { db } from "@/lib/db";
import { productImages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import AddToCart from "./AddToCart";

const SISTEL_LIMIT = 50;

async function findProductBySku(sku: string): Promise<SistelArticulo | null> {
  const base = { page: "1", limit: String(SISTEL_LIMIT) };
  const first = await sistelGetPaginated<SistelArticulo>("productos", base);
  const { totalPages } = first.pagination;

  const found = first.data.find((p) => p.Codigo === sku);
  if (found) return found;

  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        sistelGetPaginated<SistelArticulo>("productos", {
          ...base,
          page: String(i + 2),
        }).then((r) => r.data)
      )
    );
    return rest.flat().find((p) => p.Codigo === sku) ?? null;
  }

  return null;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku } = await params;

  const [product, imageRow] = await Promise.all([
    findProductBySku(sku),
    db.select().from(productImages).where(eq(productImages.sku, sku)).then((r) => r[0] ?? null),
  ]);

  if (!product) notFound();

  const imageUrl = imageRow?.firebaseUrl ?? null;
  const inStock = product.Stock > 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-6">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#8B0000] transition-colors mb-6"
        >
          <FiArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image */}
            <div className="relative aspect-square bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 flex items-center justify-center p-8">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.concepto}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-200">
                  <FiPackage className="w-24 h-24" />
                  <span className="text-sm text-gray-300">Sin imagen</span>
                </div>
              )}
              {!inStock && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="bg-white/95 text-gray-700 text-sm font-semibold px-4 py-1.5 rounded-full shadow">
                    Sin stock
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6 sm:p-8 flex flex-col gap-5">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-[#8B0000]/10 text-[#8B0000] px-2.5 py-1 rounded-full">
                  <FiLayers className="h-3 w-3" />
                  {product.rubro}
                </span>
                {product.subrubro && product.subrubro !== product.rubro && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    {product.subrubro}
                  </span>
                )}
              </div>

              {/* Name & meta */}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  {product.concepto}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                    <FiTag className="h-3.5 w-3.5" />
                    {product.marca}
                  </span>
                </div>
              </div>

              {/* SKU & barcode */}
              <div className="grid grid-cols-2 gap-3 py-4 border-y border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Código</p>
                  <p className="text-sm font-mono text-gray-700">{product.Codigo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Stock</p>
                  <p className={`text-sm font-semibold ${inStock ? "text-green-700" : "text-gray-400"}`}>
                    {inStock ? `${product.Stock} unidades` : "Agotado"}
                  </p>
                </div>
              </div>

              {/* Cart section */}
              <AddToCart
                sku={product.Codigo}
                name={product.concepto}
                price={product.PrecioFinal}
                imageUrl={imageUrl}
                inStock={inStock}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
