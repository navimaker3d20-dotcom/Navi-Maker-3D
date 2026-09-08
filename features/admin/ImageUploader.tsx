"use client";

import { useState } from "react";

export function ImageUploader({
  folder,
  onUploaded,
}: {
  folder: "products" | "designs";
  onUploaded: (url: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleFile(file: File) {
    setIsUploading(true);
    setError(null);

    try {
      const sigRes = await fetch(`/api/admin/uploads/signature?folder=${folder}`);
      const { data: sig } = await sigRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const uploaded = await uploadRes.json();

      if (!uploaded.secure_url) throw new Error("Cloudinary no regresó una URL");

      setPreviewUrl(uploaded.secure_url);
      onUploaded(uploaded.secure_url);
    } catch {
      setError("No se pudo subir la imagen. Intenta de nuevo.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="Vista previa" className="mb-2 h-24 w-24 rounded object-cover" />
      )}
      <input
        type="file"
        accept="image/*"
        disabled={isUploading}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="text-sm"
      />
      {isUploading && <p className="mt-1 text-xs text-[var(--ink-soft)]">Subiendo…</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
