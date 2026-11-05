import type { Metadata } from "next";
import { byOrder, readContent } from "@/lib/store";
import { CtaBox, PageHero } from "@/components/site/ui";
import { Count, PortfolioGrid } from "@/components/site/client";

export const metadata: Metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const c = await readContent();
  const projects = byOrder(c.projects.filter((p) => p.published));
  const s = c.settings.stats;
  return (
    <>
      <PageHero crumb="Portfolio" title="Ishlarimiz|*o'zi gapiradi*" lead={`${s.projects}+ loyiha: bank ilovalaridan qadoq dizaynigacha. Har biri — alohida hikoya. Kartani bosib batafsil ko'ring.`} />
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container"><PortfolioGrid projects={projects} /></div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="stats" data-stagger="">
            <div className="card"><div className="stat-num"><Count value={s.projects} /><sup>+</sup></div><p>Yakunlangan loyihalar</p></div>
            <div className="card"><div className="stat-num"><Count value={s.clients} /><sup>+</sup></div><p>Doimiy mijozlar</p></div>
            <div className="card"><div className="stat-num"><Count value={s.years} /></div><p>Yillik tajriba</p></div>
            <div className="card"><div className="stat-num"><Count value={s.team} /><sup>+</sup></div><p>Jamoa a&apos;zolari</p></div>
          </div>
        </div>
      </section>
      <CtaBox eyebrow="Sizning navbatingiz" title="Loyihangiz shu ro'yxatda bo'lishini *xohlaysizmi?*" button="Loyiha boshlash" />
    </>
  );
}
