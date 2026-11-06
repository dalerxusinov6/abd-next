import type { MetadataRoute } from "next";
import { byOrder, readContent } from "@/lib/store";
import { LANGS, lp } from "@/lib/i18n";
import { abs } from "@/lib/seo";

export const dynamic = "force-dynamic"; // projects come from the admin panel

type Item = { path: string; priority: number; changeFrequency: "weekly" | "monthly"; image?: string | null };

const PAGES: Item[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/portfolio", priority: 0.9, changeFrequency: "weekly" },
  { path: "/xizmatlar", priority: 0.8, changeFrequency: "monthly" },
  { path: "/biz-haqimizda", priority: 0.7, changeFrequency: "monthly" },
  { path: "/aloqa", priority: 0.7, changeFrequency: "monthly" },
];

/** Every page in every language, each listing its translations (hreflang). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await readContent();
  const items: Item[] = [
    ...PAGES,
    ...byOrder(projects.filter((p) => p.published)).map((p): Item => ({ path: `/proyekt/${p.slug}`, priority: 0.6, changeFrequency: "monthly", image: p.cover })),
  ];
  return items.flatMap((it) =>
    LANGS.map((lang) => ({
      url: abs(lp(lang, it.path)),
      changeFrequency: it.changeFrequency,
      priority: lang === "uz" ? it.priority : Math.round(it.priority * 90) / 100,
      alternates: { languages: Object.fromEntries(LANGS.map((l) => [l, abs(lp(l, it.path))])) },
      ...(it.image && !it.image.endsWith(".svg") ? { images: [abs(it.image)] } : {}),
    })),
  );
}
