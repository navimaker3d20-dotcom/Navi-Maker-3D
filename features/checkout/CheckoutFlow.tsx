"use client";

import { useState } from "react";
import { AddressStep } from "@/features/checkout/AddressStep";
import { SummaryStep } from "@/features/checkout/SummaryStep";

const STEPS = ["Dirección de envío", "Resumen y pago"] as const;

export function CheckoutFlow() {
  const [step, setStep] = useState(0);
  const [addressId, setAddressId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <ol className="mb-8 flex gap-6 text-sm">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`flex items-center gap-2 ${
              i === step ? "font-semibold text-[var(--ink)]" : "text-[var(--ink-soft)]"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                i <= step ? "bg-[var(--blue)] text-white" : "bg-[var(--line)]"
              }`}
            >
              {i + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <AddressStep selectedId={addressId} onSelect={setAddressId} onNext={() => setStep(1)} />
      )}

      {step === 1 && addressId && (
        <SummaryStep addressId={addressId} onBack={() => setStep(0)} />
      )}
    </div>
  );
}
