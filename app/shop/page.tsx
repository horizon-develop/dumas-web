import Link from "next/link";
import { Suspense } from "react";
import { sistelGetPaginated, SistelArticulo } from "@/lib/sistel";
import { db } from "@/lib/db";
import { productImages } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { ProductCard, ProductItem } from "@/features/product/components/ProductCard";
import { ShopFilters } from "@/features/product/components/ShopFilters";

const PAGE_SIZE = 48;

interface SearchParams {
  page?: string;
  q?: string;
  rubro?: string;
  marca?: string;
}

async function getProducts(sp: SearchParams) {
  const params: Record<string, string> = {
    page: sp.page ?? "1",
    limit: String(PAGE_SIZE),
  };
  if (sp.q) params.q = sp.q;
  if (sp.rubro) params.rubro = sp.rubro;
  if (sp.marca) params.marca = sp.marca;

  const sistelRes = await sistelGetPaginated<SistelArticulo>("productos", params).catch(() => null);
  if (!sistelRes) return null;

  const skus = sistelRes.data.map((p) => p.Codigo).filter(Boolean);
  const images =
    skus.length > 0
      ? await db.select().from(productImages).where(inArray(productImages.sku, skus))
      : [];

  const imageMap = Object.fromEntries(images.map((img) => [img.sku, img.firebaseUrl]));

  return {
    products: sistelRes.data.map((p) => ({ ...p, imageUrl: imageMap[p.Codigo] ?? null })),
    pagination: sistelRes.pagination,
  };
}

function buildUrl(base: SearchParams, overrides: Partial<SearchParams>) {
  const merged = { ...base, ...overrides };
  const p = new URLSearchParams();
  if (merged.q) p.set("q", merged.q);
  if (merged.rubro) p.set("rubro", merged.rubro);
  if (merged.marca) p.set("marca", merged.marca);
  if (merged.page && merged.page !== "1") p.set("page", merged.page);
  const qs = p.toString();
  return `/shop${qs ? `?${qs}` : ""}`;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const result = await getProducts(sp);

  const currentPage = Number(sp.page ?? 1);
  const totalPages = result?.pagination.totalPages ?? 1;
  const total = result?.pagination.total ?? 0;

  const rubros = result
    ? [...new Set(result.products.map((p) => p.rubro).filter(Boolean))].sort()
    : [];
  const marcas = result
    ? [...new Set(result.products.map((p) => p.marca).filter(Boolean))].sort()
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Catálogo</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {result ? `${total.toLocaleString("es-AR")} productos` : "Sin conexión a Sistel"}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Pág. {currentPage} / {totalPages}
          </p>
        </div>

        {!result && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 mb-4">
            No se pudo conectar con Sistel. Verificá la conexión.
          </div>
        )}

        <div className="flex gap-6">
          <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Filtros</h2>
              <Suspense>
                <ShopFilters rubros={rubros} marcas={marcas} />
              </Suspense>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {result && result.products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {result.products.map((product) => (
                    <ProductCard key={`${product.ID}-${product.Codigo}`} product={product as ProductItem} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    {currentPage > 1 && (
                      <Link
                        href={buildUrl(sp, { page: String(currentPage - 1) })}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        ← Anterior
                      </Link>
                    )}

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page: number;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        return (
                          <Link
                            key={page}
                            href={buildUrl(sp, { page: String(page) })}
                            className={`w-9 h-9 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
                              page === currentPage
                                ? "bg-[#8B0000] text-white"
                                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </Link>
                        );
                      })}
                    </div>

                    {currentPage < totalPages && (
                      <Link
                        href={buildUrl(sp, { page: String(currentPage + 1) })}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Siguiente →
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : result ? (
              <div className="py-16 text-center text-gray-400">
                <p className="text-lg font-medium">Sin resultados</p>
                <p className="text-sm mt-1">Intentá con otros filtros</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
