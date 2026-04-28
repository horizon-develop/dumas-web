"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { FiSearch, FiX } from "react-icons/fi";

interface ShopFiltersProps {
  rubros: string[];
  marcas: string[];
}

export const ShopFilters = ({ rubros, marcas }: ShopFiltersProps) => {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = params.get("q") ?? "";
  const currentRubro = params.get("rubro") ?? "";
  const currentMarca = params.get("marca") ?? "";

  const [searchValue, setSearchValue] = useState(currentQ);
  useEffect(() => setSearchValue(currentQ), [currentQ]);

  const navigate = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(params.toString());
      next.delete("page");
      for (const [k, v] of Object.entries(updates)) {
        if (v) next.set(k, v);
        else next.delete(k);
      }
      startTransition(() => router.push(`/shop?${next.toString()}`));
    },
    [params, router]
  );

  const clearAll = () => {
    setSearchValue("");
    startTransition(() => router.push("/shop"));
  };

  const hasFilters = currentQ || currentRubro || currentMarca;

  return (
    <div className={`transition-opacity ${isPending ? "opacity-50" : ""}`}>
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Buscar producto o código..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && navigate({ q: searchValue })}
          className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none bg-white"
        />
        {searchValue && (
          <button
            onClick={() => { setSearchValue(""); navigate({ q: "" }); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {rubros.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Categoría</p>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {rubros.map((r) => (
              <button
                key={r}
                onClick={() => navigate({ rubro: currentRubro === r ? "" : r })}
                className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  currentRubro === r
                    ? "bg-[#8B0000]/10 text-[#8B0000] font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {marcas.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Marca</p>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {marcas.map((m) => (
              <button
                key={m}
                onClick={() => navigate({ marca: currentMarca === m ? "" : m })}
                className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  currentMarca === m
                    ? "bg-[#8B0000]/10 text-[#8B0000] font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium"
        >
          <FiX className="h-3 w-3" />
          Limpiar filtros
        </button>
      )}
    </div>
  );
};
