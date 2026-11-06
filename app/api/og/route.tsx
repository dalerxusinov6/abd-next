import { ImageResponse } from "next/og";
import { dict } from "@/lib/dict";
import { isLang } from "@/lib/i18n";

/*
 * Share image (Telegram, Facebook, X, search previews): 1200×630 in the site's
 * style — dark background, dot grid, logo and the page title.
 * /api/og?lang=ru&t=Портфолио
 */
const SIZE = { width: 1200, height: 630 };

/** Fetches just the glyphs needed from Google Fonts (TTF, which Satori can read). */
async function font(family: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@700&text=${encodeURIComponent(text)}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const l = q.get("lang") ?? "uz";
  const lang = isLang(l) ? l : "uz";
  const t = dict(lang);
  const title = (q.get("t") || t.meta.title).slice(0, 90);
  const tagline = t.home.lead;

  const logo = await fetch(new URL("/img/logo.svg", req.url)).then((r) => r.text()).catch(() => "");
  const text = title + tagline + "ABD Group";
  const [outfit, onest] = await Promise.all([font("Outfit", text), font("Onest", text)]);
  const fonts = [
    ...(outfit ? [{ name: "Outfit", data: outfit, weight: 700 as const }] : []),
    ...(onest ? [{ name: "Onest", data: onest, weight: 700 as const }] : []),
  ];

  const dots = Array.from({ length: 21 * 11 }, (_, i) => i);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "#04060f", color: "#eef3ff", fontFamily: "Outfit, Onest", position: "relative" }}>
        {/* dot grid, like the site's hero background */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexWrap: "wrap", padding: "15px 0 0 30px", gap: "0" }}>
          {dots.map((i) => (
            <div key={i} style={{ width: 57, height: 57, display: "flex" }}>
              <div style={{ width: 3, height: 3, borderRadius: 3, background: i % 7 === 3 ? "rgba(0,200,255,.5)" : "rgba(255,255,255,.12)" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          {logo ? <img src={`data:image/svg+xml;base64,${Buffer.from(logo).toString("base64")}`} width={150} height={77} alt="" /> : <div style={{ fontSize: 48 }}>abd group</div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: title.length > 40 ? 64 : 84, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: 1000, display: "flex" }}>{title}</div>
          <div style={{ fontSize: 28, color: "#8b95b3", maxWidth: 900, display: "flex" }}>{tagline}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#00c8ff" }}>
          <div style={{ width: 36, height: 2, background: "#00c8ff" }} />
          ABD Group
        </div>
      </div>
    ),
    {
      ...SIZE,
      fonts: fonts.length ? fonts : undefined,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400" },
    },
  );
}
