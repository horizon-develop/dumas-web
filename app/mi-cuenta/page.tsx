import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sistelGet } from "@/lib/sistel";
import type { SistelDeuda } from "@/lib/sistel";
import { formatCurrency, formatDate } from "@/shared/utils/formatters";

export default async function MiCuentaPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [user] = await db.select().from(users).where(eq(users.id, Number(session.user.id)));
  if (!user) redirect("/login");

  if (user.status === "PENDING") {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center space-y-3">
          <div className="w-14 h-14 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-yellow-900">Cuenta pendiente de aprobación</h1>
          <p className="text-sm text-yellow-800 max-w-sm mx-auto">
            Tu solicitud fue recibida. Nuestro equipo revisará tu cuenta y te avisará cuando esté activa.
          </p>
          <p className="text-xs text-yellow-600">{user.email}</p>
        </div>
      </main>
    );
  }

  let deudas: SistelDeuda[] = [];

  if (user.sistelId) {
    const deudasRes = await sistelGet<SistelDeuda>("deudas", { IDCLiente: String(user.sistelId) }, { nocache: true }).catch(() => null);
    if (deudasRes) {
      deudas = deudasRes.data;
    }
  }

  const totalDeuda = deudas.reduce((sum, d) => sum + d.Saldo, 0);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi cuenta</h1>
        <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Nombre</p>
          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">CUIT</p>
          <p className="text-sm font-mono text-gray-900">{user.taxId ?? "—"}</p>
        </div>
        {!user.sistelId && (
          <div className="sm:col-span-2">
            <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              Tu cuenta aún no está vinculada a un cliente en nuestro sistema. Contactá al administrador.
            </p>
          </div>
        )}
      </div>

      {/* Fiado / Cuenta corriente */}
      {user.sistelId && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Cuenta corriente</h2>
              <p className="text-xs text-gray-500">Comprobantes pendientes de pago</p>
            </div>
            {totalDeuda > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Saldo total</p>
                <p className="text-lg font-bold text-[#8B0000]">{formatCurrency(totalDeuda)}</p>
              </div>
            )}
          </div>

          {deudas.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <p className="text-sm font-medium text-green-700">Sin deuda pendiente</p>
              <p className="text-xs text-green-600 mt-1">Tu cuenta está al día.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Comprobante</th>
                      <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Fecha</th>
                      <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Vencimiento</th>
                      <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Observaciones</th>
                      <th className="text-right px-4 py-3 font-semibold">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {deudas.map((d, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-gray-700">{d.Comprobante}</td>
                        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{formatDate(d.Fecha)}</td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatDate(d.FechaVenc)}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell max-w-[200px] truncate">
                          {d.Observaciones__ || "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(d.Saldo)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-sm font-bold text-gray-700 hidden sm:table-cell">Total</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-[#8B0000]">{formatCurrency(totalDeuda)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
