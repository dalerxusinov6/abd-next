import type { Metadata } from "next";
import Image from "next/image";
import { byOrder, readContent } from "@/lib/store";
import { CtaBox, Eyebrow, PageHero, Split, initials } from "@/components/site/ui";
import { Count } from "@/components/site/client";
import { loc, type Lang } from "@/lib/i18n";
import { dict } from "@/lib/dict";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: dict((await params).lang as Lang).about.title };
}

const VALUE_ICONS = [
  "M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8",
  "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 3",
  "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z",
];

export default async function AboutPage({ params }: Props) {
  const lang = (await params).lang as Lang;
  const t = dict(lang).about;
  const content = await readContent();
  const s = content.settings.stats;
  const team = byOrder(content.team).map((m) => loc(m, lang));
  return (
    <>
      <PageHero lang={lang} crumb={t.title} title={t.heroTitle} lead={t.lead(s.team)} />
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="stats" data-stagger="">
            <div className="card"><div className="stat-num"><Count value={s.years} /><sup>{t.yearsUnit}</sup></div><p>{t.stats[0]}</p></div>
            <div className="card"><div className="stat-num"><Count value={s.projects} /><sup>+</sup></div><p>{t.stats[1]}</p></div>
            <div className="card"><div className="stat-num"><Count value={s.team} /><sup>+</sup></div><p>{t.stats[2]}</p></div>
            <div className="card"><div className="stat-num"><Count value={s.clients} /><sup>+</sup></div><p>{t.stats[3]}</p></div>
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head"><div><Eyebrow>{t.valuesEyebrow}</Eyebrow><Split text={t.valuesTitle} /></div></div>
          <div className="values" data-stagger="">
            {t.values.map(([title, d], i) => (
              <div className="card" key={title}><div className="svc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d={VALUE_ICONS[i]} /></svg></div><h3>{title}</h3><p>{d}</p></div>
            ))}
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head"><div><Eyebrow>{t.historyEyebrow}</Eyebrow><Split text={t.historyTitle} /></div></div>
          <div className="timeline">
            <span className="progress" />
            {t.timeline.map(([y, title, d]) => <div className="tl-item" data-reveal="left" key={y}><span className="yr">{y}</span><div><h3>{title}</h3><p>{d}</p></div></div>)}
          </div>
        </div>
      </section>
      {team.length > 0 && <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head"><div><Eyebrow>{t.teamEyebrow}</Eyebrow><Split text={t.teamTitle} /></div></div>
          <div className="team" data-stagger="">
            {team.map((m) => (
              <div className="card member" key={m.id}>
                <div className="member-photo" style={{ background: m.color }}>
                  {m.photo ? <Image src={m.photo} alt={m.name} fill sizes="(max-width: 680px) 50vw, 25vw" unoptimized={m.photo.endsWith(".svg")} /> : <b>{initials(m.name)}</b>}
                </div>
                <div className="member-info"><h4>{m.name}</h4><span>{m.role}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>}
      <CtaBox lang={lang} eyebrow={t.ctaEyebrow} title={t.ctaTitle} button={t.ctaButton} />
    </>
  );
}
