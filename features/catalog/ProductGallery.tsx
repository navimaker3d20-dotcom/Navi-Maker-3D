"use client";

import { useState } from "react";

type Image = { url: string; altText: string };

export function ProductGallery({ images }: { images: Image[] }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-md border border-[var(--line)] bg-[var(--blue-tint)]">
        {current && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.url} alt={current.altText} className="h-full w-full object-cover" />
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setActive(i)}
              className={`h-16 w-16 overflow-hidden rounded border ${
                i === active ? "border-[var(--blue)]" : "border-[var(--line)]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.altText} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
