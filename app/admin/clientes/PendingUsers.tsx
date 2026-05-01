"use client";

import { useTransition } from "react";
import { toast } from "react-hot-toast";
import { FiCheck, FiX, FiLink } from "react-icons/fi";
import { approveUser, rejectUser } from "./actions";
import { formatDate } from "@/shared/utils/formatters";

type PendingUser = {
  id: number;
  name: string;
  email: string;
  taxId: string | null;
  sistelId: number | null;
  createdAt: Date;
};

export default function PendingUsers({ users }: { users: PendingUser[] }) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = (userId: number, name: string) => {
    startTransition(async () => {
      try {
        await approveUser(userId);
        toast.success(`${name} aprobado`);
      } catch {
        toast.error("Error al aprobar");
      }
    });
  };

  const handleReject = (userId: number, name: string) => {
    if (!confirm(`¿Rechazar la solicitud de ${name}? El usuario no podrá iniciar sesión.`)) return;
    startTransition(async () => {
      try {
        await rejectUser(userId);
        toast.success(`Solicitud de ${name} rechazada`);
      } catch {
        toast.error("Error al rechazar");
      }
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-base font-bold text-gray-900">Solicitudes pendientes</h2>
        <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
          {users.length}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-yellow-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-yellow-50 text-xs text-gray-500 uppercase border-b border-yellow-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Nombre</th>
              <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">CUIT</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Registro</th>
              <th className="text-left px-4 py-3 font-semibold">Sistel</th>
              <th className="text-right px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{u.email}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 hidden md:table-cell">{u.taxId ?? "—"}</td>
                <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  {u.sistelId ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      <FiLink className="h-3 w-3" />
                      ID {u.sistelId}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Sin vincular</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleApprove(u.id, u.name)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      <FiCheck className="h-3 w-3" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleReject(u.id, u.name)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      <FiX className="h-3 w-3" />
                      Rechazar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
