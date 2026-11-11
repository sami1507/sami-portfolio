import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/metadata";
import "../../globals.css";

export const metadata = pageMetadata("he");

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          rel="preload"
          href="/fonts/heebo.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/manrope.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
