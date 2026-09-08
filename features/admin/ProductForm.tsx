"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/features/admin/ImageUploader";

type Category = { id: string; name: string };

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(({ data }) => setCategories(data));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const priceMxn = Number(form.get("price"));

    if (!imageUrl) {
      setError("Sube una imagen del producto antes de guardar");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name,
      slug: slugify(name),
      description: form.get("description"),
      categoryId: form.get("categoryId"),
      basePriceCents: Math.round(priceMxn * 100),
      sku: form.get("sku"),
      stock: Number(form.get("stock")),
      material: form.get("material") || undefined,
      status: "ACTIVE",
      images: [{ url: imageUrl, altText: name, order: 0 }],
      variants: [],
    };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const { error: apiError } = await res.json();
      setError(apiError?.message ?? "No se pudo crear el producto");
      setIsSubmitting(false);
      return;
    }

    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <label className="label">Nombre</label>
        <input
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input w-full"
        />
        {name && <p className="mt-1 text-xs text-[var(--ink-soft)]">/producto/{slugify(name)}</p>}
      </div>

      <div>
        <label className="label">Descripción</label>
        <textarea name="description" required rows={3} className="input w-full" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Categoría</label>
          <select name="categoryId" required className="input w-full">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">SKU</label>
          <input name="sku" required className="input w-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Precio (MXN)</label>
          <input name="price" type="number" min="1" step="0.01" required className="input w-full" />
        </div>
        <div>
          <label className="label">Stock inicial</label>
          <input name="stock" type="number" min="0" defaultValue={0} required className="input w-full" />
        </div>
      </div>

      <div>
        <label className="label">Material (opcional)</label>
        <input name="material" placeholder="PLA, resina…" className="input w-full" />
      </div>

      <div>
        <label className="label">Imagen principal</label>
        <ImageUploader folder="products" onUploaded={setImageUrl} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-[var(--blue)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
      >
        {isSubmitting ? "Guardando…" : "Crear producto"}
      </button>
    </form>
  );
}
