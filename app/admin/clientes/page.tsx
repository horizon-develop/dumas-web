import Link from "next/link";
import { sistelGetPaginated, SistelCliente } from "@/lib/sistel";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { ne } from "drizzle-orm";
import ClientesTable from "./ClientesTable";
import PendingUsers from "./PendingUsers";

const SISTEL_LIMIT = 50;

interface SearchParams {
  page?: string;
  q?: string;
}

async function fetchAllSistelClientes(): Promise<SistelCliente[]> {
  const base = { page: "1", limit: String(SISTEL_LIMIT) };
  const first = await sistelGetPaginated<SistelCliente>("clientes", base);
  const { totalPages } = first.pagination;
  if (totalPages <= 1) return first.data;
  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      sistelGetPaginated<SistelCliente>("clientes", {
        ...base,
        page: String(i + 2),
      }).then((r) => r.data)
    )
  );
  return [...first.data, ...rest.flat()];
}

function buildUrl(sp: SearchParams, overrides: Partial<SearchParams>) {
  const merged = { ...sp, ...overrides };
  const p = new URLSearchParams();
  if (merged.q) p.set("q", merged.q);
  if (merged.page && merged.page !== "1") p.set("page", merged.page);
  const qs = p.toString();
  return `/admin/clientes${qs ? `?${qs}` : ""}`;
}

export default async function AdminClientesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  let sistelData: SistelCliente[] = [];
  let pagination = { page: 1, limit: SISTEL_LIMIT, total: 0, totalPages: 0 };
  let sistelOk = true;

  if (sp.q) {
    try {
      const q = sp.q.toLowerCase();
      const all = await fetchAllSistelClientes();
      const matched = all.filter(
        (c) =>
          c.RazonSocial.toLowerCase().includes(q) ||
          c.CUIT.includes(q) ||
          c.Email?.toLowerCase().includes(q) ||
          c.Localidad?.toLowerCase().includes(q) ||
          c.Provincia?.toLowerCase().includes(q)
      );
      sistelData = matched;
      pagination = { page: 1, limit: matched.length, total: matched.length, totalPages: 1 };
    } catch {
      sistelOk = false;
    }
  } else {
    try {
      const res = await sistelGetPaginated<SistelCliente>("clientes", {
        page: sp.page ?? "1",
        limit: String(SISTEL_LIMIT),
      });
      sistelData = res.data;
      pagination = res.pagination;
    } catch {
      sistelOk = false;
    }
  }

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      taxId: users.taxId,
      sistelId: users.sistelId,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(ne(users.role, "ADMIN"));

  const pendingUsers = allUsers.filter((u) => u.status === "PENDING");
  const activeUsers = allUsers.filter((u) => u.status !== "PENDING");
  const linkedMap = new Map(
    activeUsers.filter((u) => u.sistelId != null).map((u) => [u.sistelId!, u])
  );

  const clientes = sistelData.map((c) => ({ ...c, linkedUser: linkedMap.get(c.ID) ?? null }));
  const availableUsers = activeUsers.filter((u) => u.sistelId == null);

  const currentPage = Number(sp.page ?? 1);
  const totalPages = pagination.totalPages;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        {sistelOk && (
          <p className="text-sm text-gray-500 mt-1">
            {sp.q
              ? `${pagination.total} resultado${pagination.total !== 1 ? "s" : ""}`
              : `${pagination.total.toLocaleString("es-AR")} clientes en Sistel`}
          </p>
        )}
      </div>

      {pendingUsers.length > 0 && <PendingUsers users={pendingUsers} />}

      {!sistelOk && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          No se pudo conectar con el servidor Sistel. Verificá la conexión en .env.local.
        </div>
      )}

      <form className="flex gap-2 flex-wrap" method="get">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Buscar por razón social, CUIT, email, localidad..."
          className="flex-1 min-w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/30"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-[#8B0000] text-white rounded-lg hover:bg-[#6A0000] transition-colors"
        >
          Buscar
        </button>
        {sp.q && (
          <Link
            href="/admin/clientes"
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Limpiar
          </Link>
        )}
      </form>

      <ClientesTable clientes={clientes} availableUsers={availableUsers} />

      {!sp.q && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
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
    </div>
  );
}
