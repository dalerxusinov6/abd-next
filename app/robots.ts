import type { MetadataRoute } from "next";
import { abs, indexable } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // preview deployments and local dev stay out of search engines
  if (!indexable()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: abs("/sitemap.xml"),
    host: abs("/"),
  };
}
