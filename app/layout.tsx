import type { Metadata, Viewport } from "next";
import { Onest, Outfit } from "next/font/google";
import { headers } from "next/headers";
import { isLang } from "@/lib/i18n";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-outfit", display: "swap" });
// Outfit has no Cyrillic: Onest (a similar geometric face) draws the Russian glyphs.
const onest = Onest({ subsets: ["cyrillic"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-cyr", display: "swap" });

export const metadata: Metadata = {
  title: "ABD Group — Raqamli yechimlar studiyasi",
  description: "ABD Group: veb-saytlar, mobil ilovalar, brending va CRM tizimlari.",
  icons: { icon: "/img/logo.svg" },
};

export const viewport: Viewport = { themeColor: "#04060f" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // set by proxy.ts for site pages; the admin panel is Uzbek-only
  const h = (await headers()).get("x-lang") ?? undefined;
  const lang = isLang(h) ? h : "uz";
  return (
    <html lang={lang} className={`${outfit.variable} ${onest.variable}`}>
      <body>{children}</body>
    </html>
  );
}
