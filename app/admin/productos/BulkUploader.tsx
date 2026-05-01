"use client";

import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { FiUpload, FiX, FiLayers } from "react-icons/fi";
import { uploadProductImage } from "@/shared/services/storage";
import { compressImage, isAllowedFormat } from "@/shared/utils/imageUtils";

type FileStatus = "pending" | "compressing" | "uploading" | "done" | "error";

interface QueueEntry {
  id: string;
  file: File;
  preview: string;
  sku: string;
  status: FileStatus;
  error?: string;
}

export function BulkUploader() {
  const [open, setOpen] = useState(false);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [running, setRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | File[]) => {
    const entries: QueueEntry[] = Array.from(files)
      .filter(isAllowedFormat)
      .map((f) => ({
        id: `${Date.now()}-${Math.random()}`,
        file: f,
        preview: URL.createObjectURL(f),
        sku: f.name.replace(/\.[^.]+$/, ""),
        status: "pending",
      }));
    if (entries.length < Array.from(files).length) {
      toast.error("Algunos archivos ignorados: solo JPG, PNG o WebP");
    }
    setQueue((prev) => [...prev, ...entries]);
  };

  const updateSku = (id: string, sku: string) =>
    setQueue((prev) => prev.map((e) => (e.id === id ? { ...e, sku } : e)));

  const remove = (id: string) =>
    setQueue((prev) => prev.filter((e) => e.id !== id));

  const setStatus = (id: string, status: FileStatus, error?: string) =>
    setQueue((prev) => prev.map((e) => (e.id === id ? { ...e, status, error } : e)));

  const handleUploadAll = async () => {
    const pending = queue.filter((e) => e.status === "pending" || e.status === "error");
    if (!pending.length) return;
    setRunning(true);

    for (const entry of pending) {
      if (!entry.sku.trim()) {
        setStatus(entry.id, "error", "SKU vacío");
        continue;
      }

      setStatus(entry.id, "compressing");
      let compressed: File;
      try {
        compressed = await compressImage(entry.file);
      } catch {
        setStatus(entry.id, "error", "Error de compresión");
        continue;
      }

      setStatus(entry.id, "uploading");
      try {
        const url = await uploadProductImage(compressed, () => {});
        const res = await fetch("/api/admin/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sku: entry.sku.trim(), firebaseUrl: url }),
        });
        if (!res.ok) throw new Error();
        setStatus(entry.id, "done");
      } catch {
        setStatus(entry.id, "error", "Error al subir");
      }
    }

    setRunning(false);
    const doneCount = queue.filter((e) => e.status === "done").length + pending.filter((_, i) => {
      return false;
    }).length;
    toast.success("Carga masiva finalizada");
  };

  const pendingCount = queue.filter((e) => e.status === "pending" || e.status === "error").length;

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
          open
            ? "bg-[#8B0000] text-white border-[#8B0000]"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        }`}
      >
        <FiLayers className="w-4 h-4" />
        Carga masiva
      </button>

      {open && (
        <div className="mt-3 bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-3">
            Arrastrá o seleccioná imágenes. El SKU se pre-completa desde el nombre del archivo — podés editarlo.
          </p>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg py-8 text-center cursor-pointer hover:border-[#8B0000]/40 hover:bg-red-50/20 transition-colors mb-4"
          >
            <FiUpload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Arrastrá archivos aquí o hacé click</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG o WebP</p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
            />
          </div>

          {queue.length > 0 && (
            <>
              <div className="space-y-2 max-h-80 overflow-y-auto mb-4 pr-1">
                {queue.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <img
                      src={entry.preview}
                      alt=""
                      className="w-12 h-12 object-cover rounded-md flex-shrink-0 border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-400 truncate mb-1">{entry.file.name}</p>
                      <input
                        type="text"
                        value={entry.sku}
                        onChange={(e) => updateSku(entry.id, e.target.value)}
                        placeholder="SKU"
                        disabled={entry.status === "uploading" || entry.status === "compressing" || entry.status === "done"}
                        className="w-full text-sm border border-gray-200 rounded px-2 py-1 outline-none focus:border-[#8B0000]/50 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </div>
                    <div className="flex-shrink-0 text-right min-w-[80px]">
                      {entry.status === "pending" && <span className="text-xs text-gray-400">Pendiente</span>}
                      {entry.status === "compressing" && <span className="text-xs text-blue-500">Comprimiendo…</span>}
                      {entry.status === "uploading" && <span className="text-xs text-yellow-600">Subiendo…</span>}
                      {entry.status === "done" && <span className="text-xs text-green-600 font-medium">✓ Listo</span>}
                      {entry.status === "error" && <span className="text-xs text-red-500">{entry.error}</span>}
                    </div>
                    {entry.status !== "uploading" && entry.status !== "compressing" && entry.status !== "done" && (
                      <button onClick={() => remove(entry.id)} className="text-gray-300 hover:text-red-500 flex-shrink-0">
                        <FiX className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setQueue([])}
                  disabled={running}
                  className="text-sm text-gray-400 hover:text-gray-600 disabled:opacity-40"
                >
                  Limpiar todo
                </button>
                <button
                  onClick={handleUploadAll}
                  disabled={running || pendingCount === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-[#8B0000] text-white text-sm rounded-lg hover:bg-[#6A0000] disabled:opacity-50 transition-colors"
                >
                  <FiUpload className="h-4 w-4" />
                  {running ? "Subiendo…" : `Subir ${pendingCount} imagen${pendingCount !== 1 ? "es" : ""}`}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
