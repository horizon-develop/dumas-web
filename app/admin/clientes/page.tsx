import { sistelGet, SistelCliente } from "@/lib/sistel";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { ne } from "drizzle-orm";
import ClientesTable from "./ClientesTable";
import PendingUsers from "./PendingUsers";

export default async function AdminClientesPage() {
  const [sistelRes, allUsers] = await Promise.all([
    sistelGet<SistelCliente>("clientes")
      .then((r) => ({ ok: true as const, data: r.data }))
      .catch(() => ({ ok: false as const, data: [] as SistelCliente[] })),
    db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      taxId: users.taxId,
      sistelId: users.sistelId,
      status: users.status,
      createdAt: users.createdAt,
    }).from(users).where(ne(users.role, "ADMIN")),
  ]);

  const pendingUsers = allUsers.filter((u) => u.status === "PENDING");
  const activeUsers = allUsers.filter((u) => u.status !== "PENDING");

  const linkedMap = new Map(
    activeUsers.filter((u) => u.sistelId != null).map((u) => [u.sistelId!, u])
  );

  const clientes = sistelRes.data.map((cliente) => ({
    ...cliente,
    linkedUser: linkedMap.get(cliente.ID) ?? null,
  }));

  const availableUsers = activeUsers.filter((u) => u.sistelId == null);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="text-sm text-gray-500 mt-1">
          {sistelRes.ok ? `${clientes.length} clientes en Sistel` : "No se pudo conectar con Sistel"}
        </p>
      </div>

      {pendingUsers.length > 0 && <PendingUsers users={pendingUsers} />}

      {!sistelRes.ok && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          No se pudo conectar con el servidor Sistel. Verificá la conexión en .env.local.
        </div>
      )}

      <ClientesTable clientes={clientes} availableUsers={availableUsers} />
    </div>
  );
}
