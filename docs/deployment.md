# Despliegue — Navi Maker 3D

## 1. Base de datos administrada

Usa un Postgres administrado que soporte conexiones serverless (Vercel no mantiene conexiones persistentes entre invocaciones):

- **Neon** o **Supabase** son las opciones más simples para empezar — ambos tienen plan gratuito y connection pooling integrado (necesario para Prisma en serverless).
- Copia la connection string a `DATABASE_URL`. Si tu proveedor separa la URL "pooled" de la "directa" (Neon lo hace), usa la **pooled** en `DATABASE_URL` y agrega `DIRECT_URL` en `prisma/schema.prisma` para que las migraciones corran contra la conexión directa:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## 2. Desplegar en Vercel

1. Conecta el repositorio de GitHub en [vercel.com/new](https://vercel.com/new). Vercel detecta Next.js automáticamente — no necesitas configurar build command a mano.
2. En **Settings → Environment Variables**, agrega TODAS las variables de `.env.example`, tanto para el ambiente de **Production** como **Preview** (usa credenciales de prueba de Mercado Pago en Preview).
3. Agrega un paso de build que corra las migraciones antes de compilar, en **Settings → Build Command**:
   ```bash
   npx prisma migrate deploy && npx prisma generate && next build
   ```
   (`migrate deploy`, no `migrate dev` — en producción nunca se generan migraciones nuevas al vuelo, solo se aplican las ya creadas y commiteadas).
4. Despliega. Copia la URL final (ej. `https://navimaker3d.vercel.app` o tu dominio propio) a `NEXT_PUBLIC_APP_URL` y vuelve a desplegar — varias partes del código (sitemap, checkout, emails, GA4) la usan para construir URLs absolutas.

## 3. Conectar Mercado Pago al dominio real

En tu cuenta de Mercado Pago (Tus integraciones → tu app → Webhooks), registra:

```
https://TU-DOMINIO/api/webhooks/mercadopago
```

Y copia el **secreto de firma** que te dé a `MERCADOPAGO_WEBHOOK_SECRET` en Vercel.

## 4. Dominio propio

Si compras un dominio (ej. `navimaker3d.com`), agrégalo en **Settings → Domains** de Vercel y sigue las instrucciones de DNS. Actualiza `NEXT_PUBLIC_APP_URL` y `NEXTAUTH_URL` a la URL final con dominio propio antes de anunciar el lanzamiento — cambiarla después invalida las sesiones activas.

## 5. Antes de anunciar el lanzamiento

- [ ] Cambiaste las contraseñas del seed (`prisma/seed.ts`) o corriste el seed solo en una base de datos de prueba, nunca en producción con esas contraseñas.
- [ ] `MERCADOPAGO_ACCESS_TOKEN` es de **producción**, no de prueba (empiezan distinto: `TEST-` vs `APP_USR-`).
- [ ] Corriste `npm run test` y pasa (`services/pricing.ts` es la pieza más sensible).
- [ ] Verificaste manualmente un pedido de punta a punta con una tarjeta de prueba de Mercado Pago antes de aceptar pagos reales.
- [ ] `NEXT_PUBLIC_GA_ID` y `GA_API_SECRET` están configurados y ves eventos llegando en GA4 (Informes en tiempo real).
