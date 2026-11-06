import type { Metadata } from "next";
import { LANGS, lp, type Lang } from "./i18n";

/*
 * SEO helpers: absolute URLs, canonical + hreflang for every page, and the
 * shared Open Graph / Twitter tags. Set SITE_URL (e.g. https://abdgroup.uz)
 * when the site moves to its own domain; Vercel's production URL is the fallback.
 */
export function siteUrl(): string {
  const raw = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    || "http://localhost:3100";
  return raw.replace(/\/+$/, "");
}

/** Only the production deployment may be indexed (not previews or local dev). */
export const indexable = () => process.env.VERCEL_ENV === "production" || process.env.SITE_INDEXABLE === "1";

export const abs = (path: string) => (/^https?:/.test(path) ? path : `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`);

const OG_LOCALE: Record<Lang, string> = { uz: "uz_UZ", ru: "ru_RU", en: "en_US" };

/** canonical + hreflang (uz, ru, en, x-default) for a site path like "/portfolio". */
export function alternates(lang: Lang, path: string): Metadata["alternates"] {
  return {
    canonical: abs(lp(lang, path)),
    languages: { ...Object.fromEntries(LANGS.map((l) => [l, abs(lp(l, path))])), "x-default": abs(lp("uz", path)) },
  };
}

/** Full metadata for a site page. `image` overrides the generated share image. */
export function pageMeta(lang: Lang, path: string, { title, description, image, absoluteTitle }: {
  title?: string; description: string; image?: string | null; absoluteTitle?: boolean;
}): Metadata {
  const shareTitle = title ? (absoluteTitle ? title : `${title} — ABD Group`) : undefined;
  return {
    ...(title ? { title: absoluteTitle ? { absolute: title } : title } : {}),
    description,
    alternates: alternates(lang, path),
    openGraph: {
      type: "website",
      siteName: "ABD Group",
      url: abs(lp(lang, path)),
      locale: OG_LOCALE[lang],
      alternateLocale: LANGS.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
      ...(shareTitle ? { title: shareTitle } : {}),
      description,
      ...(image ? { images: [{ url: abs(image) }] } : {}),
    },
    twitter: { card: "summary_large_image", ...(shareTitle ? { title: shareTitle } : {}), description, ...(image ? { images: [abs(image)] } : {}) },
  };
}

/** <script type="application/ld+json"> payload; "<" is escaped so text can't close the tag. */
export const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });

/* ---------- schema.org (JSON-LD) ---------- */
export const ORG_ID = () => abs("/#organization");

export function organizationLd(lang: Lang, s: { phone: string; email: string; telegram: string; address: string }) {
  const tg = s.telegram.replace(/^@/, "");
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": ORG_ID(),
      name: "ABD Group",
      url: abs(lp(lang, "/")),
      logo: abs("/img/logo.svg"),
      foundingDate: "2023",
      email: s.email,
      telephone: s.phone.replace(/\s/g, ""),
      address: { "@type": "PostalAddress", addressLocality: "Tashkent", addressCountry: "UZ" },
      areaServed: ["UZ", "KZ", "AE"],
      knowsLanguage: ["uz", "ru", "en"],
      ...(tg ? { sameAs: [`https://t.me/${tg}`] } : {}),
      contactPoint: { "@type": "ContactPoint", contactType: "customer service", telephone: s.phone.replace(/\s/g, ""), email: s.email, availableLanguage: ["Uzbek", "Russian", "English"] },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": abs("/#website"),
      name: "ABD Group",
      url: abs(lp(lang, "/")),
      inLanguage: lang,
      publisher: { "@id": ORG_ID() },
    },
  ];
}

export function breadcrumbLd(lang: Lang, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(lp(lang, it.path)) })),
  };
}

export function faqLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
}
