import type { Metadata } from "next";
import { breadcrumbLd, jsonLd, pageMeta } from "@/lib/seo";
import { CtaBox, Eyebrow, PageHero, Split } from "@/components/site/ui";
import { SERVICES } from "@/lib/services";
import type { Lang } from "@/lib/i18n";
import { dict } from "@/lib/dict";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = (await params).lang as Lang;
  const d = dict(lang);
  return pageMeta(lang, "/xizmatlar", { title: d.services.title, description: d.meta.services, image: `/api/og?lang=${lang}&t=${encodeURIComponent(d.services.title)}` });
}

export default async function ServicesPage({ params }: Props) {
  const lang = (await params).lang as Lang;
  const t = dict(lang).services;
  return (
    <>
      <PageHero lang={lang} crumb={t.title} title={t.heroTitle} lead={t.lead} />
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="svc-grid">
            {SERVICES.map((s, i) => {
              const it = t.items[s.id];
              return (
                <article className="card svc-card" id={s.id} key={s.id} data-reveal="" data-delay={i % 2 ? ".1" : undefined} data-tilt="">
                  <div className="svc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg></div>
                  <h2 className="h-2">{it.title}</h2>
                  <p>{it.text}</p>
                  <ul>{it.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head"><div><Eyebrow>{t.processEyebrow}</Eyebrow><Split text={t.processTitle} /></div></div>
          <div className="process" data-stagger="">
            {t.steps.map(([title, d]) => <div className="card step" key={title}><h4>{title}</h4><p>{d}</p></div>)}
          </div>
        </div>
      </section>
      <CtaBox lang={lang} eyebrow={t.ctaEyebrow} title={t.ctaTitle} button={t.ctaButton} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbLd(lang, [{ name: dict(lang).nav.home, path: "/" }, { name: t.title, path: "/xizmatlar" }]))} />
    </>
  );
}
