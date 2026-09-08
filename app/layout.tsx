import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { ChatWidget } from "@/features/chatbot/ChatWidget";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://navimaker3d.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Navi Maker 3D — Ideas que toman forma",
    template: "%s | Navi Maker 3D",
  },
  description: "Figuras de anime, articuladas, llaveros y personalizados impresos en 3D en México.",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Navi Maker 3D",
    title: "Navi Maker 3D — Ideas que toman forma",
    description: "Figuras de anime, articuladas, llaveros y personalizados impresos en 3D en México.",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthSessionProvider>
          {/* Suspense es obligatorio: GoogleAnalytics usa useSearchParams(),
              que en el App Router solo puede leerse dentro de un límite de
              Suspense sin forzar toda la app a renderizado dinámico. */}
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
          {children}
          <ChatWidget />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
