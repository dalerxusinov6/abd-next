import type { Metadata } from "next";
import { breadcrumbLd, jsonLd, pageMeta } from "@/lib/seo";
import { byOrder, readContent } from "@/lib/store";
import { CtaBox, PageHero } from "@/components/site/ui";
import { Count, PortfolioGrid } from "@/components/site/client";
import { loc, type Lang } from "@/lib/i18n";
import { dict } from "@/lib/dict";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = (await params).lang as Lang;
  const d = dict(lang);
  return pageMeta(lang, "/portfolio", { title: d.portfolio.title, description: d.meta.portfolio, image: `/api/og?lang=${lang}&t=${encodeURIComponent(d.portfolio.title)}` });
}

export default async function PortfolioPage({ params }: Props) {
  const lang = (await params).lang as Lang;
  const t = dict(lang).portfolio;
  const c = await readContent();
  const projects = byOrder(c.projects.filter((p) => p.published)).map((p) => loc(p, lang));
  const s = c.settings.stats;
  return (
    <>
      <PageHero lang={lang} crumb={t.title} title={t.heroTitle} lead={t.lead(s.projects)} />
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container"><PortfolioGrid projects={projects} /></div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="stats" data-stagger="">
            <div className="card"><div className="stat-num"><Count value={s.projects} /><sup>+</sup></div><p>{t.stats[0]}</p></div>
            <div className="card"><div className="stat-num"><Count value={s.clients} /><sup>+</sup></div><p>{t.stats[1]}</p></div>
            <div className="card"><div className="stat-num"><Count value={s.years} /></div><p>{t.stats[2]}</p></div>
            <div className="card"><div className="stat-num"><Count value={s.team} /><sup>+</sup></div><p>{t.stats[3]}</p></div>
          </div>
        </div>
      </section>
      <CtaBox lang={lang} eyebrow={t.ctaEyebrow} title={t.ctaTitle} button={t.ctaButton} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbLd(lang, [{ name: dict(lang).nav.home, path: "/" }, { name: t.title, path: "/portfolio" }]))} />
    </>
  );
}
