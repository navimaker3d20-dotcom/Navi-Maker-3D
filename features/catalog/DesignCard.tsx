"use client";

import { useState } from "react";
import { trackViewDesign } from "@/lib/analytics/events";

type Design = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string | null;
};

export function DesignCard({ design }: { design: Design }) {
  const [expanded, setExpanded] = useState(false);

  function handleClick() {
    trackViewDesign(design.id, design.name);
    setExpanded((v) => !v);
  }

  return (
    <button onClick={handleClick} className="block w-full overflow-hidden rounded-md border border-[var(--line)] text-left">
      <div className={`overflow-hidden bg-[var(--navy)] ${expanded ? "aspect-video" : "aspect-square"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={design.imageUrl} alt={design.name} className="h-full w-full object-cover" />
      </div>
      <div className="p-3">
        {design.category && <div className="text-[11px] text-[var(--ink-soft)]">{design.category}</div>}
        <div className="text-sm font-medium">{design.name}</div>
        {expanded && <p className="mt-2 text-xs text-[var(--ink-soft)]">{design.description}</p>}
      </div>
    </button>
  );
}
