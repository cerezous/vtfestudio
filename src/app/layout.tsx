import type { Metadata } from "next";

import { ClearStaleServiceWorker } from "@/shared/components/clear-stale-service-worker";
import { AppProviders } from "@/shared/providers/app-providers";
import { APP_NAME, APP_TAGLINE } from "@/shared/lib/constants";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_TAGLINE,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className="min-h-svh font-sans antialiased"
      >
        <ClearStaleServiceWorker />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
