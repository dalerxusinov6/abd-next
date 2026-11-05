import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-outfit", display: "swap" });

export const metadata: Metadata = {
  title: { default: "ABD Group — Raqamli yechimlar studiyasi", template: "%s — ABD Group" },
  description: "ABD Group: veb-saytlar, mobil ilovalar, brending va CRM tizimlari.",
  icons: { icon: "/img/logo.svg" },
};

export const viewport: Viewport = { themeColor: "#04060f" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={outfit.variable}>
      <body>{children}</body>
    </html>
  );
}
