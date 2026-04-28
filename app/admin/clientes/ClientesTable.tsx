"use client";

import { useState, useMemo, useTransition } from "react";
import { FiSearch, FiLink, FiScissors, FiX, FiCheck } from "react-icons/fi";
import { toast } from "react-hot-toast";
import type { SistelCliente } from "@/lib/sistel";
import { linkSistelClient, unlinkSistelClient } from "./actions";

type UserRow = {
  id: number;
  name: string;
  email: string;
  sistelId: number | null;
};

type ClienteRow = SistelCliente & { linkedUser: UserRow | null };

interface Props {
  clientes: ClienteRow[];
  availableUsers: UserRow[];
}

export default function ClientesTable({ clientes, availableUsers }: Props) {
  const [search, setSearch] = useState("");
  const [linkingId, setLinkingId] = useState<number | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return clientes;
    return clientes.filter(
      (c) =>
        c.RazonSocial.toLowerCase().includes(q) ||
        c.CUIT.includes(q) ||
        c.Email.toLowerCase().includes(q) ||
        c.Localidad.toLowerCase().includes(q)
    );
  }, [clientes, search]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    if (!q) return availableUsers;
    return availableUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [availableUsers, userSearch]);

  const linkingCliente = linkingId != null ? clientes.find((c) => c.ID === linkingId) : null;

  const handleLink = (userId: number) => {
    if (!linkingId) return;
    startTransition(async () => {
      try {
        await linkSistelClient(userId, linkingId);
        toast.success("Cuenta vinculada");
        setLinkingId(null);
        setUserSearch("");
      } catch {
        toast.error("Error al vincular");
      }
    });
  };

  const handleUnlink = (userId: number) => {
    startTransition(async () => {
      try {
        await unlinkSistelClient(userId);
        toast.success("Cuenta desvinculada");
      } catch {
        toast.error("Error al desvincular");
      }
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por razón social, CUIT, email, localidad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Razón Social</th>
                <th className="text-left px-4 py-3 font-semibold">CUIT</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Localidad</th>
                <th className="text-left px-4 py-3 font-semibold">Cuenta Web</th>
                <th className="text-right px-4 py-3 font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((cliente) => (
                <tr key={cliente.ID} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{cliente.RazonSocial}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{cliente.CUIT}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{cliente.Email}</td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{cliente.Localidad}</td>
                  <td className="px-4 py-3">
                    {cliente.linkedUser ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                        <FiCheck className="h-3 w-3" />
                        {cliente.linkedUser.email}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Sin cuenta</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {cliente.linkedUser ? (
                      <button
                        onClick={() => handleUnlink(cliente.linkedUser!.id)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                      >
                        <FiScissors className="h-3 w-3" />
                        Desvincular
                      </button>
                    ) : (
                      <button
                        onClick={() => setLinkingId(cliente.ID)}
                        className="inline-flex items-center gap-1.5 text-xs text-[#8B0000] hover:text-[#6A0000] font-medium"
                      >
                        <FiLink className="h-3 w-3" />
                        Vincular
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                    No se encontraron clientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {linkingCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => { setLinkingId(null); setUserSearch(""); }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <button
              onClick={() => { setLinkingId(null); setUserSearch(""); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Cerrar"
            >
              <FiX className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Vincular cuenta</h3>
            <p className="text-sm text-gray-500 mb-4">
              Selecciona la cuenta web para{" "}
              <span className="font-semibold text-gray-800">{linkingCliente.RazonSocial}</span>
            </p>

            <div className="relative mb-3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
                autoFocus
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredUsers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No hay usuarios disponibles para vincular
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleLink(user.id)}
                    disabled={isPending}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
