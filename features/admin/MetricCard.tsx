export function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-[var(--card)] p-5">
      <div className="text-xs text-[var(--ink-soft)]">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-[var(--ink-soft)]">{hint}</div>}
    </div>
  );
}
