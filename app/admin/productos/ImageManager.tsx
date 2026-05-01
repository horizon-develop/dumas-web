"use client";

import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { uploadProductImage, deleteProductImage } from "@/shared/services/storage";
import { compressImage, isAllowedFormat } from "@/shared/utils/imageUtils";
import { FiUpload, FiTrash2, FiPackage } from "react-icons/fi";

interface Props {
  sku: string;
  concepto: string;
  initialImageUrl: string | null;
}

export function ImageManager({ sku, concepto, initialImageUrl }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!isAllowedFormat(file)) { toast.error("Formato no permitido. Usa JPG, PNG o WebP."); return; }
    setUploading(true);
    setProgress(0);
    try {
      const compressed = await compressImage(file);
      const url = await uploadProductImage(compressed, setProgress);

      const res = await fetch("/api/admin/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku, firebaseUrl: url }),
      });

      if (!res.ok) throw new Error("DB save failed");

      setImageUrl(url);
      toast.success("Imagen guardada");
    } catch {
      toast.error("Error al subir la imagen");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!imageUrl) return;
    setConfirmDelete(false);
    try {
      if (imageUrl.includes("firebasestorage.googleapis.com")) {
        await deleteProductImage(imageUrl);
      }
      const res = await fetch("/api/admin/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku }),
      });
      if (!res.ok) throw new Error("DB delete failed");
      setImageUrl(null);
      toast.success("Imagen eliminada");
    } catch {
      toast.error("Error al eliminar la imagen");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center relative">
        {imageUrl ? (
          <img src={imageUrl} alt={concepto} className="w-full h-full object-contain" />
        ) : (
          <FiPackage className="w-10 h-10 text-gray-200" />
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/85 flex flex-col items-center justify-center gap-1">
            <div className="w-3/4 bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-[#8B0000] h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500">{Math.round(progress)}%</span>
          </div>
        )}
      </div>

      <div className="flex gap-1.5 w-full">
        {confirmDelete ? (
          <>
            <button
              onClick={handleDelete}
              className="flex-1 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-[#8B0000] text-white rounded-md hover:bg-[#6A0000] disabled:opacity-50 transition-colors"
            >
              <FiUpload className="w-3 h-3" />
              {imageUrl ? "Cambiar" : "Subir"}
            </button>
            {imageUrl && (
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={uploading}
                className="flex items-center justify-center px-2 py-1.5 text-xs text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                <FiTrash2 className="w-3 h-3" />
              </button>
            )}
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".webp,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUpload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
