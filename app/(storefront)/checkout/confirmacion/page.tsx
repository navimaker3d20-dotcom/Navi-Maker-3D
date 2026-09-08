export const metadata = { title: "Pedido confirmado — Navi Maker 3D" };

export default function ConfirmacionPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--blue-tint)] text-[var(--blue)]">
        ✓
      </div>
      <h1 className="text-xl font-semibold">¡Gracias por tu pedido!</h1>
      {searchParams.order && (
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Número de pedido: <span className="font-medium text-[var(--ink)]">{searchParams.order}</span>
        </p>
      )}
      <p className="mt-4 text-sm text-[var(--ink-soft)]">
        Te avisaremos por correo en cuanto confirmemos tu pago y comencemos a imprimir tu figura.
      </p>
      {/* El estado real (aprobado/pendiente/rechazado) lo actualiza el webhook
          de Mercado Pago (Fase 4) de forma asíncrona — esta pantalla no debe
          asumir que el pago ya está aprobado solo por haber regresado aquí. */}
    </div>
  );
}
