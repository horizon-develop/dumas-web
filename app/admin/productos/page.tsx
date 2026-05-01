import Link from "next/link";
import { sistelGetPaginated, SistelArticulo } from "@/lib/sistel";
import { db } from "@/lib/db";
import { productImages } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { ImageManager } from "./ImageManager";
import { BulkUploader } from "./BulkUploader";

const PAGE_SIZE = 24;
const SISTEL_LIMIT = 50;

interface SearchParams {
  page?: string;
  q?: string;
  rubro?: string;
}

async function fetchAllSistelProducts(rubro?: string): Promise<SistelArticulo[]> {
  const base: Record<string, string> = { page: "1", limit: String(SISTEL_LIMIT) };
  if (rubro) base.rubro = rubro;

  const first = await sistelGetPaginated<SistelArticulo>("productos", base);
  const { totalPages } = first.pagination;

  if (totalPages <= 1) return first.data;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      sistelGetPaginated<SistelArticulo>("productos", {
        ...base,
        page: String(i + 2),
      }).then((r) => r.data)
    )
  );

  return [...first.data, ...rest.flat()];
}

async function getProducts(sp: SearchParams) {
  if (sp.q) {
    const q = sp.q.toLowerCase();
    let all: SistelArticulo[];
    try {
      all = await fetchAllSistelProducts(sp.rubro);
    } catch {
      return null;
    }
    const matched = all.filter(
      (p) =>
        p.Codigo?.toLowerCase().includes(q) ||
        p.concepto?.toLowerCase().includes(q)
    );

    const skus = matched.map((p) => p.Codigo).filter(Boolean);
    const images =
      skus.length > 0
        ? await db.select().from(productImages).where(inArray(productImages.sku, skus))
        : [];
    const imageMap = Object.fromEntries(images.map((img) => [img.sku, img.firebaseUrl]));

    return {
      products: matched.map((p) => ({ ...p, imageUrl: imageMap[p.Codigo] ?? null })),
      pagination: { page: 1, limit: matched.length, total: matched.length, totalPages: 1 },
    };
  }

  const params: Record<string, string> = {
    page: sp.page ?? "1",
    limit: String(PAGE_SIZE),
  };
  if (sp.rubro) params.rubro = sp.rubro;

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
  if (merged.page && merged.page !== "1") p.set("page", merged.page);
  const qs = p.toString();
  return `/admin/productos${qs ? `?${qs}` : ""}`;
}

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const result = await getProducts(sp);

  const currentPage = Number(sp.page ?? 1);
  const totalPages = result?.pagination.totalPages ?? 1;
  const total = result?.pagination.total ?? 0;
  const withImages = result?.products.filter((p) => p.imageUrl).length ?? 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Imágenes de productos</h1>
        {result && (
          <p className="text-sm text-gray-500 mt-1">
            {sp.q
              ? <>{total.toLocaleString("es-AR")} resultados · <span className="text-green-700 font-medium">{withImages} con imagen</span></>
              : <>{total.toLocaleString("es-AR")} productos en catálogo · <span className="text-green-700 font-medium">{withImages} con imagen</span> en esta página</>
            }
          </p>
        )}
      </div>

      <BulkUploader />

      <form className="mb-6 flex gap-2 flex-wrap" method="get">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Buscar producto o código..."
          className="flex-1 min-w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/30"
        />
        <input
          name="rubro"
          defaultValue={sp.rubro}
          placeholder="Rubro"
          className="w-40 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/30"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-[#8B0000] text-white rounded-lg hover:bg-[#6A0000] transition-colors"
        >
          Buscar
        </button>
        {(sp.q || sp.rubro) && (
          <Link
            href="/admin/productos"
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Limpiar
          </Link>
        )}
      </form>

      {!result && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          No se pudo conectar con Sistel. Verificá la conexión.
        </div>
      )}

      {result && result.products.length === 0 && (
        <div className="py-16 text-center text-gray-400">
          <p className="text-lg font-medium">Sin resultados</p>
          <p className="text-sm mt-1">Intentá con otros filtros</p>
        </div>
      )}

      {result && result.products.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {result.products.map((product) => (
              <div
                key={product.Codigo}
                className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col gap-2"
              >
                <div>
                  <p className="text-[10px] text-gray-400 font-mono truncate">{product.Codigo}</p>
                  <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 mt-0.5">
                    {product.concepto}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{product.marca}</p>
                </div>
                <ImageManager
                  sku={product.Codigo}
                  concepto={product.concepto}
                  initialImageUrl={product.imageUrl}
                />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              {currentPage > 1 && (
                <Link
                  href={buildUrl(sp, { page: String(currentPage - 1) })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Anterior
                </Link>
              )}
              <span className="text-sm text-gray-600">
                Pág. {currentPage} / {totalPages}
              </span>
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
      )}
    </div>
  );
}
