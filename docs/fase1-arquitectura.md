# Tienda Virtual de Figuras 3D — Fase 1: Arquitectura General

## 1. Análisis de requerimientos (resumen)

El proyecto es un e-commerce vertical (figuras 3D impresas bajo pedido) que debe soportar:
catálogo con variantes, carrito persistente, checkout con Mercado Pago, roles (customer/admin/super_admin),
panel administrativo, galería de diseños tipo portafolio, chatbot, analytics de e-commerce, SEO técnico, y
una base que permita crecer hacia multi-vendedor, cupones, puntos, afiliados, app móvil y API pública sin
reescritura.

La decisión de diseño más importante: **separar estrictamente UI, lógica de negocio y acceso a datos**, para
que integraciones futuras (WhatsApp, CRM, marketplace) se conecten a la capa de servicios, no a los componentes.

---

## 2. Stack tecnológico (y por qué)

| Capa | Tecnología | Justificación |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | SSR/SSG híbrido para SEO de producto, Route Handlers como backend, un solo repo/deploy |
| Lenguaje | **TypeScript estricto** | Tipado en modelos de dominio (Order, Payment) reduce errores de precio/stock |
| UI | **React + Tailwind CSS** | Velocidad de desarrollo, diseño consistente vía design tokens |
| Componentes base | **shadcn/ui (Radix)** | Accesibles, sin bloatear el bundle, fáciles de "sobre-diseñar" para no verse genéricos |
| Base de datos | **PostgreSQL** | Relacional, soporta relaciones complejas (variantes, cupones, multi-vendedor futuro) |
| ORM | **Prisma** | Migraciones versionadas, tipos generados automáticamente, buen fit con TS |
| Auth | **Auth.js (NextAuth v5)** | Sesiones + roles + providers (email/password y social si se desea después) |
| Pagos | **Mercado Pago (Checkout Pro + Webhooks)** | Estándar de facto en México/LatAm, evita PCI compliance directo |
| Imágenes | **Cloudinary** | Optimización automática (AVIF/WebP), transformaciones on-the-fly, mejor que S3 puro para catálogo visual |
| Analytics | **GA4 + capa de eventos propia (dataLayer)** | Permite añadir GTM o Meta Pixel después sin tocar el código de negocio |
| Chatbot | **API propia `/api/chat` + OpenAI (server-side)** | Nunca expone la key; queda listo para WhatsApp/Instagram vía el mismo servicio |
| Emails | **Resend** (recomendado) | API simple, buena entregabilidad, fácil de sustituir por SES después |
| Validación | **Zod** | Un solo schema sirve para validar formularios en cliente y payloads en servidor |
| Hosting | **Vercel** (app) + **Neon/Supabase** (Postgres administrado) | Despliegue nativo de Next.js, escalado automático, sin gestión de servidores |
| Rate limiting | **Upstash Redis** | Serverless, se integra bien con Vercel Edge |

> Si en el futuro el catálogo crece a decenas de miles de productos con búsqueda compleja, se puede añadir
> **Meilisearch/Algolia** como capa de búsqueda sin cambiar el modelo de datos.

---

## 3. Arquitectura de capas

```
┌─────────────────────────────────────────────┐
│  UI (app/**)  — Server & Client Components   │
├─────────────────────────────────────────────┤
│  features/**  — lógica de presentación,      │
│  hooks, componentes específicos de dominio   │
├─────────────────────────────────────────────┤
│  services/**  — lógica de negocio pura       │
│  (pricing, stock, checkout, chatbot)         │
├─────────────────────────────────────────────┤
│  lib/**       — clientes externos            │
│  (mercadopago, cloudinary, resend, ga4)      │
├─────────────────────────────────────────────┤
│  prisma/**    — acceso a datos (repositorios)│
└─────────────────────────────────────────────┘
```

Regla dura: **los componentes de UI nunca llaman a Prisma directamente**. Siempre pasan por `services/`.
Esto es lo que permite, más adelante, exponer una API pública o una app móvil reutilizando los mismos servicios.

### Flujo de checkout (crítico para seguridad)

1. Cliente arma el carrito (IDs + cantidades únicamente, nunca precios).
2. `POST /api/orders` recalcula precios, stock y total **en el servidor** desde la base de datos.
3. Se crea `Order` en estado `PENDING_PAYMENT` y una preferencia en Mercado Pago con ese total verificado.
4. Mercado Pago redirige al checkout; el webhook `/api/webhooks/mercadopago` es la única fuente de verdad
   para confirmar el pago (nunca se confía en el redirect del navegador).
5. El webhook valida la firma, actualiza `Payment` y `Order.status`, y dispara el email de confirmación.

---

## 4. Estructura de carpetas

```
/app
  /(storefront)
    /page.tsx                 → Home
    /tienda/page.tsx          → Catálogo
    /producto/[slug]/page.tsx → Detalle de producto
    /disenos/page.tsx         → Galería de diseños
    /carrito/page.tsx
    /checkout/page.tsx
    /cuenta/...                → login, registro, perfil, pedidos
  /admin
    /dashboard/page.tsx
    /productos/...
    /categorias/...
    /pedidos/...
    /disenos/...
    /cupones/...
    /usuarios/...
  /api
    /products/route.ts
    /categories/route.ts
    /cart/route.ts
    /orders/route.ts
    /payments/route.ts
    /webhooks/mercadopago/route.ts
    /reviews/route.ts
    /chat/route.ts
    /auth/[...nextauth]/route.ts

/components        → componentes de UI genéricos y reutilizables (Button, Card, Modal)
/features           → módulos por dominio: cart/, checkout/, catalog/, admin/, chatbot/
/services            → lógica de negocio: pricing.ts, inventory.ts, checkout.ts, orders.ts
/lib                 → integraciones externas: mercadopago.ts, cloudinary.ts, resend.ts, analytics.ts
/hooks               → hooks compartidos (useCart, useAuth)
/types               → tipos de dominio compartidos
/schemas             → validaciones Zod (compartidas cliente/servidor)
/prisma
  /schema.prisma
  /migrations
  /seed.ts
/public
```

**Responsabilidad de cada carpeta:**
- `app/`: solo orquesta — arma la página con datos ya validados, sin reglas de negocio.
- `features/`: componentes y hooks que pertenecen a UN dominio (ej. `features/cart/CartDrawer.tsx`).
- `services/`: funciones puras testeables que implementan reglas de negocio (cálculo de envío, validación de stock).
- `lib/`: wrappers delgados sobre SDKs externos, para poder sustituir un proveedor sin tocar `services/`.
- `schemas/`: un Zod schema por entidad, reutilizado en formularios (cliente) y en los route handlers (servidor).

---

## 5. Modelo de base de datos (Prisma, resumen conceptual)

Entidades principales y relaciones clave:

- **User** 1—N **Address**, 1—N **Order**, 1—N **Review**, 1—1 **Cart**, N—N **Product** (Wishlist)
- **Product** N—1 **Category**, 1—N **ProductImage**, 1—N **ProductVariant**, 1—N **Review**
- **Order** 1—N **OrderItem**, 1—1 **Payment**, N—1 **User**, N—1 **Address**
- **Design** N—N **DesignTag**
- **Coupon** N—N **Order** (a través de uso registrado)

Campos con timestamps (`createdAt`, `updatedAt`) en todas las tablas. Índices en `slug`, `sku`, `status`,
y llaves foráneas (`categoryId`, `userId`, `productId`).

El schema Prisma completo (con todos los campos, enums de `OrderStatus`, `Role`, etc.) se entrega en la
**Fase 3**, junto con el seed de datos de prueba — así evitamos generar un schema gigante ahora que
todavía puede ajustarse según lo que confirmes en esta fase.

---

## 6. Seguridad (resumen de decisiones)

- Nunca se confía en precios/cantidades enviados por el cliente — se recalculan server-side antes de crear la orden.
- Autorización por middleware (`middleware.ts`) que protege `/admin/**` y valida rol `ADMIN`/`SUPER_ADMIN`.
- Webhook de Mercado Pago verificado con la firma (`x-signature`) antes de procesar cualquier evento.
- Passwords con hashing (bcrypt/argon2) vía Auth.js — nunca en texto plano.
- Rate limiting en `/api/auth/*`, `/api/orders`, `/api/chat` para evitar abuso.
- Todas las credenciales en variables de entorno (`.env.example` se entrega en la Fase 4).
- Validación de entrada con Zod en cada route handler, no solo en el formulario.

---

## 7. Integraciones futuras — cómo quedan preparadas

| Integración futura | Cómo la deja lista esta arquitectura |
|---|---|
| App móvil | `services/` y `/api` ya son la "API interna"; se puede exponer como API pública versionada (`/api/v1`) |
| Multi-vendedor | `Product` ya referenciaría un `sellerId` — se añade sin romper relaciones existentes |
| Cupones / puntos | Tablas `Coupon` y futura `PointsLedger` se enganchan al `services/checkout.ts` sin tocar UI |
| WhatsApp/Instagram | El chatbot ya vive en un servicio desacoplado (`services/chatbot.ts`) que solo necesita un nuevo "canal" |
| Multi-moneda | Precio se modela como entero en centavos + `currency` (ISO 4217) desde el inicio, aunque hoy solo se use MXN |

---

## 8. Próximo paso (Fase 2)

Con esta arquitectura confirmada, la Fase 2 sería el diseño UI/UX (Home, Tienda, Producto, Carrito, Checkout,
Perfil, Diseños, Admin) — puedo mostrarte wireframes/mockups de las pantallas clave antes de pasar a
código, o si prefieres, saltar directo a la Fase 3 (schema Prisma completo) y a la Fase 4 (endpoints).

¿Con cuál seguimos?
