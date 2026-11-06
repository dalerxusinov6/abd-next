import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { byOrder, readContent } from "@/lib/store";
import { Arrow, Eyebrow, Roll, Split, WorkArt } from "@/components/site/ui";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const c = await readContent();
  const list = byOrder(c.projects.filter((p) => p.published));
  const idx = list.findIndex((p) => p.slug === slug);
  if (idx < 0) return null;
  return { p: list[idx], next: list[(idx + 1) % list.length] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load((await params).slug);
  return data ? { title: `${data.p.name} — ${data.p.type}`, description: data.p.description } : { title: "Loyiha topilmadi" };
}

export default async function ProjectPage({ params }: Props) {
  const data = await load((await params).slug);
  if (!data) notFound();
  const { p, next } = data;
  const shots = p.gallery.length ? p.gallery : null;

  return (
    <>
      <section className="p-hero">
        <canvas className="dot-field" aria-hidden="true" />
        <div className="container">
          <Link href="/portfolio" className="back" data-reveal=""><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>Barcha loyihalar</Link>
          <Split as="h1" className="h-display" text={p.name} />
          <p className="lead" data-reveal="" data-delay=".3">{p.description}</p>
          {p.url && (
            <div className="p-visit" data-reveal="" data-delay=".4">
              <a href={p.url} className="btn btn-primary" target="_blank" rel="noopener noreferrer"><Roll>Saytga o&apos;tish</Roll><Arrow /></a>
            </div>
          )}
          <div className="p-meta" data-stagger="">
            <div><small>Yo&apos;nalish</small><b>{p.type}</b></div>
            <div><small>Yil</small><b>{p.year}</b></div>
            <div><small>Muddat</small><b>{p.duration}</b></div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="p-cover" data-reveal="fade"><WorkArt p={p} /></div>
      </section>

      <section className="section" style={{ paddingBottom: 40 }}>
        <div className="container">
          {p.task && <div className="p-text" data-reveal=""><h2>Vazifa</h2><p>{p.task}</p></div>}
          {p.solution && <div className="p-text" data-reveal=""><h2>Yechim</h2><p>{p.solution}</p></div>}
          {p.services.length > 0 && <div className="p-text" data-reveal=""><h2>Xizmatlar</h2><ul>{p.services.map((s) => <li key={s}>{s}</li>)}</ul></div>}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="p-gallery">
            {shots
              ? shots.map((src, i) => <div className="shot" key={src} data-reveal="scale" data-delay={String((i % 2) * 0.1)}><WorkArt p={p} image={src} /></div>)
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
            <div className="section-head"><div><Eyebrow>Natijalar</Eyebrow><Split text="Raqamlarda" /></div></div>
            <div className="p-results" data-stagger="">
              {p.results.map((r, i) => <div className="card" key={i}><div className="stat-num">{r.value}</div><p>{r.label}</p></div>)}
            </div>
          </div>
        </section>
      )}

      {next && next.id !== p.id && (
        <section className="container">
          <Link href={`/proyekt/${next.slug}`} className="p-next">
            <small>Keyingi loyiha</small>
            <div className="h-display">{next.name}</div>
            <span className="work-go"><Arrow className="" /></span>
          </Link>
        </section>
      )}
    </>
  );
}
