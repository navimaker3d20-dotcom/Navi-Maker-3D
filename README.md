# Navi Maker 3D — Proyecto completo (Fases 1–13)

Tienda de figuras impresas en 3D (anime, articuladas, llaveros, personalizados) para el mercado mexicano. Next.js 14 (App Router) + PostgreSQL/Prisma + Mercado Pago + Auth.js + GA4 + chatbot + panel admin.

## Cómo levantar el proyecto desde cero

```bash
npm install

cp .env.example .env
# Completa al menos: DATABASE_URL, NEXTAUTH_SECRET, MERCADOPAGO_ACCESS_TOKEN,
# OPENAI_API_KEY — el resto puede quedar vacío para probar localmente
# (rate limiting y Cloudinary se degradan sin tumbar la app; sin Cloudinary
# no podrás subir imágenes desde el admin).

npx prisma migrate dev --name init
npm run db:seed

npm run dev        # http://localhost:3000
npm run test       # corre las pruebas de services/pricing.ts y lib/password.ts
```

## Credenciales de prueba (creadas por el seed)

| Rol | Email | Password |
|---|---|---|
| Super admin | superadmin@navimaker3d.com | CambiaEstaPassword123 |
| Admin | admin@navimaker3d.com | CambiaEstaPassword123 |
| Cliente | cliente@ejemplo.com | ClientePrueba123 |

**Cámbialas antes de producción** — están en texto plano en `prisma/seed.ts` solo para desarrollo local. También se crean 5 categorías, 5 productos con imagen placeholder y el cupón `BIENVENIDA10`.

## Estructura del proyecto

```
app/
  (storefront)/       ← Home, /tienda, /producto/[slug], /disenos, /carrito, /checkout, /cuenta/*
                         (comparten header + footer vía su propio layout.tsx)
  admin/               ← panel administrativo (layout con su propio sidebar, sin header público)
  api/                 ← todos los endpoints REST
  sitemap.ts, robots.ts
lib/                   ← prisma, auth, api-response, rate-limit, email, cloudinary, analytics/
schemas/               ← validación Zod por dominio
services/              ← lógica de negocio (pricing, orders, admin-metrics)
store/, hooks/         ← Zustand (carrito, chat) + hooks que unifican estado local y API
features/              ← componentes de UI por dominio (cart, checkout, catalog, account, admin, chatbot, layout)
prisma/                ← schema.prisma + seed.ts
tests/                 ← Vitest
docs/                  ← arquitectura, mockup original, guía de deployment
```

## Qué se construyó, fase por fase

| Fase | Contenido |
|---|---|
| 1 | Arquitectura, stack, estructura de carpetas — `docs/fase1-arquitectura.md` |
| 2 | Diseño UI/UX con la marca real (logo + azul de Navi Maker 3D) — `docs/mockup-home.html` (mockup original) y el Home real en `app/(storefront)/page.tsx` |
| 3 | Schema completo de Prisma, incluido `PasswordResetToken` y `gaClientId` — `prisma/schema.prisma` |
| 4 | Backend/API completo: productos, categorías, carrito, pedidos, pagos, webhook, reseñas, chatbot |
| 5 | Autenticación completa: registro, login, recuperar/restablecer contraseña, perfil, direcciones, roles |
| 6 | Carrito y checkout (2 pasos), con carrito de invitado en localStorage y migración al iniciar sesión |
| 7 | Mercado Pago: preferencia de pago + webhook con verificación de firma HMAC |
| 8 | GA4 completo: eventos ecommerce + `purchase` server-side (Measurement Protocol) desde el webhook |
| 9 | Chatbot flotante, con escalamiento a WhatsApp cuando no puede responder |
| 10 | Panel admin **completo**: Dashboard, Productos, Categorías, Pedidos, Diseños, Cupones, Usuarios (con roles) |
| 11 | SEO: metadata dinámica y JSON-LD por producto, `sitemap.ts`, `robots.ts`, Open Graph global |
| 12 | Testing: Vitest configurado, pruebas del servicio de pricing (la lógica más crítica) y de hashing de contraseñas |
| 13 | Deployment: `next.config.js` con headers de seguridad, `docs/deployment.md` con la guía de Vercel |
| Extra | Subida de imágenes a Cloudinary conectada de verdad (productos y diseños), no solo URLs pegadas a mano |

## Páginas construidas

**Públicas**: `/`, `/tienda`, `/producto/[slug]`, `/disenos`, `/carrito`, `/checkout`, `/checkout/confirmacion`, `/cuenta/login`, `/cuenta/registro`, `/cuenta/recuperar-contrasena`, `/cuenta/restablecer-contrasena`, `/cuenta/perfil`, `/cuenta/pedidos`.

**Admin** (`/admin/**`, protegido por middleware + verificación server-side): `dashboard`, `productos` (+ `nuevo`), `categorias`, `pedidos`, `disenos`, `cupones`, `usuarios`.

## Verificaciones ya hechas sobre este ZIP

- Todos los imports con alias `@/` resuelven a un archivo real (verificado con un script contra el árbol completo).
- Todas las carpetas dinámicas de `app/api` tienen su `route.ts`.
- `tsconfig.json`, `tailwind.config.ts` y `postcss.config.js` están presentes (antes faltaban).
- Las clases `.input`/`.label` usadas en todos los formularios están definidas en `app/globals.css` (antes se usaban sin existir).
- `AuthSessionProvider` está montado en `app/layout.tsx` — sin esto, `useSession()` fallaba en tiempo de ejecución en todos los componentes que dependen de la sesión (carrito, header, login, admin sidebar).

Esto no reemplaza correr `npm install && npm run build` de verdad, pero reduce mucho la probabilidad de errores obvios de "archivo no encontrado" al primer intento.

## Lo que sigue siendo trabajo manual (no se puede resolver solo con código)

- Crear las cuentas reales de Mercado Pago, GA4, Cloudinary, Resend, OpenAI y Upstash, y llenar `.env`.
- Probar un pedido de punta a punta con tarjetas de prueba de Mercado Pago antes de aceptar pagos reales.
- Subir fotos reales de tus figuras (hoy el seed usa placeholders genéricos).
- Decidir el copy legal real de aviso de privacidad, términos y política de envíos/devoluciones (Sección 29 del brief original) — no se generó contenido legal porque eso requiere una decisión de negocio, no una plantilla genérica.
- Revisar `docs/deployment.md` y desplegar en Vercel con una base de datos administrada (Neon/Supabase).

Cuando quieras seguir — ya sea una de estas piezas manuales, pulir algo específico, o agregar algo nuevo al alcance original — dime con cuál.
