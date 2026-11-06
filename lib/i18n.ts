/*
 * Languages: Uzbek is the default and lives at "/", Russian and English at
 * "/ru/..." and "/en/...". proxy.ts rewrites un-prefixed URLs to /uz/... so
 * every site page sits under app/(site)/[lang].
 */
export const LANGS = ["uz", "ru", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "uz";
export const EXTRA_LANGS = ["ru", "en"] as const;
export type ExtraLang = (typeof EXTRA_LANGS)[number];

export const LANG_LABELS: Record<Lang, string> = { uz: "O'zbekcha", ru: "Русский", en: "English" };

export const isLang = (v: string | undefined): v is Lang => (LANGS as readonly string[]).includes(v ?? "");

/** Site path for a language: lp("ru", "/portfolio") → "/ru/portfolio". */
export function lp(lang: Lang, path: string) {
  if (lang === DEFAULT_LANG) return path;
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}

/** Splits "/ru/portfolio" into { lang: "ru", path: "/portfolio" }. */
export function splitPath(pathname: string): { lang: Lang; path: string } {
  const seg = pathname.split("/")[1];
  if (seg === "ru" || seg === "en") return { lang: seg, path: pathname.slice(seg.length + 1) || "/" };
  return { lang: DEFAULT_LANG, path: pathname || "/" };
}

/** Translations stored next to the Uzbek original; empty fields fall back to Uzbek. */
export type Tr<T> = Partial<Record<ExtraLang, Partial<T>>>;

/** Returns the item with its RU/EN overrides applied (non-empty values only). */
export function loc<T extends { tr?: Tr<object> }>(item: T, lang: Lang): T {
  if (lang === "uz") return item;
  const over = item.tr?.[lang] as Record<string, unknown> | undefined;
  if (!over) return item;
  const out: Record<string, unknown> = { ...item };
  for (const [k, v] of Object.entries(over)) {
    if (typeof v === "string" ? v.trim() : Array.isArray(v) ? v.length : v != null) out[k] = v;
  }
  return out as T;
}
