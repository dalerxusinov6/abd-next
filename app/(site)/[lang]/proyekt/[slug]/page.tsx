import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { byOrder, readContent } from "@/lib/store";
import { Arrow, Eyebrow, Roll, Split, WorkArt } from "@/components/site/ui";
import { loc, lp, type Lang } from "@/lib/i18n";
import { dict } from "@/lib/dict";

type Props = { params: Promise<{ slug: string; lang: string }> };

async function load(slug: string, lang: Lang) {
  const c = await readContent();
  const list = byOrder(c.projects.filter((p) => p.published)).map((p) => loc(p, lang));
  const idx = list.findIndex((p) => p.slug === slug);
  if (idx < 0) return null;
  return { p: list[idx], next: list[(idx + 1) % list.length] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;
  const data = await load(slug, lang as Lang);
  return data ? { title: `${data.p.name} — ${data.p.type}`, description: data.p.description } : { title: dict(lang as Lang).project.notFound };
}

export default async function ProjectPage({ params }: Props) {
  const { slug, lang: l } = await params;
  const lang = l as Lang;
  const t = dict(lang).project;
  const data = await load(slug, lang);
  if (!data) notFound();
  const { p, next } = data;
  const shots = p.gallery.length ? p.gallery : null;

  return (
    <>
      <section className="p-hero">
        <canvas className="dot-field" aria-hidden="true" />
        <div className="container">
          <Link href={lp(lang, "/portfolio")} className="back" data-reveal=""><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>{t.back}</Link>
          <Split as="h1" className="h-display" text={p.name} />
          <p className="lead" data-reveal="" data-delay=".3">{p.description}</p>
          {p.url && (
            <div className="p-visit" data-reveal="" data-delay=".4">
              <a href={p.url} className="btn btn-primary" target="_blank" rel="noopener noreferrer"><Roll>{t.visit}</Roll><Arrow /></a>
            </div>
          )}
          <div className="p-meta" data-stagger="">
            <div><small>{t.direction}</small><b>{p.type}</b></div>
            <div><small>{t.year}</small><b>{p.year}</b></div>
            <div><small>{t.duration}</small><b>{p.duration}</b></div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="p-cover" data-reveal="fade"><WorkArt p={p} sizes="100vw" priority /></div>
      </section>

      <section className="section" style={{ paddingBottom: 40 }}>
        <div className="container">
          {p.task && <div className="p-text" data-reveal=""><h2>{t.task}</h2><p>{p.task}</p></div>}
          {p.solution && <div className="p-text" data-reveal=""><h2>{t.solution}</h2><p>{p.solution}</p></div>}
          {p.services.length > 0 && <div className="p-text" data-reveal=""><h2>{t.services}</h2><ul>{p.services.map((s) => <li key={s}>{s}</li>)}</ul></div>}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="p-gallery">
            {shots
              ? shots.map((src, i) => <div className="shot" key={src} data-reveal="scale" data-delay={String((i % 2) * 0.1)}><WorkArt p={p} image={src} sizes={i === 0 ? "100vw" : "(max-width: 680px) 100vw, 50vw"} /></div>)
              : (
                <>
                  <div className="shot" data-reveal="scale"><WorkArt p={p} image={null} /></div>
                  <div className="shot" data-reveal="scale"><WorkArt p={p} image={null} dim /></div>
                  <div className="shot" data-reveal="scale" data-delay=".1"><div className="work-art" style={{ background: p.accent }}><div className="work-logo" style={{ color: "#050816", textShadow: "none" }}>{p.name}</div></div></div>
                </>
              )}
          </div>
        </div>
      </section>

      {p.results.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head"><div><Eyebrow>{t.resultsEyebrow}</Eyebrow><Split text={t.resultsTitle} /></div></div>
            <div className="p-results" data-stagger="">
              {p.results.map((r, i) => <div className="card" key={i}><div className="stat-num">{r.value}</div><p>{r.label}</p></div>)}
            </div>
          </div>
        </section>
      )}

      {next && next.id !== p.id && (
        <section className="container">
          <Link href={lp(lang, `/proyekt/${next.slug}`)} className="p-next">
            <small>{t.next}</small>
            <div className="h-display">{next.name}</div>
            <span className="work-go"><Arrow className="" /></span>
          </Link>
        </section>
      )}
    </>
  );
}
