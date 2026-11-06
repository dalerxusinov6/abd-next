import type { Metadata } from "next";
import NotFound from "@/components/site/NotFound";

export const metadata: Metadata = { title: "404" };

export default function SiteNotFound() {
  return <NotFound />;
}
