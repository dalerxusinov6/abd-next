import Link from "next/link";
import { byOrder, readContent } from "@/lib/store";
import { Arrow, Btn, CtaBox, Eyebrow, Split, WorkCard } from "@/components/site/ui";
import { Count, FaqList, Testimonials } from "@/components/site/client";
import { LogoParticles, Rotator } from "@/components/site/Hero";
import { SERVICES } from "@/lib/services";
import { loc, lp, type Lang } from "@/lib/i18n";
import { dict } from "@/lib/dict";

const HOME_SIZES = ["w-5 tall", "w-7", "w-7", "w-5", "w-6", "w-6"];
const TECH = ["Figma", "React", "Next.js", "Python", "Flutter", "Node.js", "Laravel"];

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang; // validated by the layout
  const t = dict(lang), h = t.home, to = (p: string) => lp(lang, p);
  const c = await readContent();
  const projects = byOrder(c.projects.filter((p) => p.published)).slice(0, 6).map((p) => loc(p, lang));
  const clients = byOrder(c.clients);
  const { stats, heroWords } = loc(c.settings, lang);
  const words = heroWords.length ? heroWords : c.settings.heroWords;

  return (
    <>
      {/* HERO */}
      <section className="hero hero-v3">
        <canvas className="dot-field" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1 className="h-display hero-title">
              {h.heroLines.map((line, i, all) => (
                <span className="hl" data-reveal="" data-delay={i ? String(i * 0.08) : undefined} key={i}>
                  {line === "{rot}" ? <Rotator words={words.length ? words : ["—"]} /> : line}
                  {i === all.length - 1 && <i className="caret" aria-hidden="true" />}
                </span>
              ))}
            </h1>
            <p className="lead" data-reveal="" data-delay=".35">{h.lead}</p>
            <div className="hero-cta" data-reveal="" data-delay=".45">
              <Btn href={to("/aloqa")}>{h.ctaStart}</Btn>
              <Btn href={to("/portfolio")} variant="ghost">{h.ctaWorks}</Btn>
            </div>
          </div>
          <div className="hero-art" data-reveal="fade" data-delay=".2">
            <LogoParticles />
            <div className="art-frame" aria-hidden="true"><i /><i /><i /><i /></div>
            <div className="art-hint" aria-hidden="true"><span className="key">●</span> {h.artHint}</div>
            <div className="spin-badge" aria-hidden="true">
              <svg className="ring" viewBox="0 0 110 110"><defs><path id="circ" d="M55,55 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0" /></defs><text><textPath href="#circ">{h.badge}</textPath></text></svg>
              <span className="core"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg></span>
            </div>
          </div>
        </div>
        <div className="container hero-foot" data-stagger="">
          <div><b><Count value={stats.projects} /></b><span>{h.countProjects}</span></div>
          <div><b><Count value={stats.clients} /></b><span>{h.countClients}</span></div>
          <div><b><Count value={stats.years} /></b><span>{h.countYears}</span></div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee" aria-label={h.marquee}>
        <div className="marquee-track">
          {[...TECH, ...TECH].flatMap((t, i) => [<div className="marquee-item" key={`t${i}`}>{t}</div>, <div className="marquee-item" key={`s${i}`} aria-hidden="true">✦</div>])}
        </div>
      </div>

      {/* ABOUT */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div><Eyebrow>{h.aboutEyebrow}</Eyebrow><Split text={h.aboutTitle} /></div>
            <Btn href={to("/biz-haqimizda")} variant="ghost" arrow reveal>{h.more}</Btn>
          </div>
          <div className="bento bento-3">
            <div className="card" data-reveal=""><div className="stat-num"><Count value={stats.projects} /><sup>+</sup></div><p>{h.statProjects}</p></div>
            <div className="card" data-reveal="" data-delay=".08"><div className="stat-num"><Count value={stats.clients} /><sup>+</sup></div><p>{h.statClients}</p></div>
            <div className="card" data-reveal="" data-delay=".16"><div className="stat-num">2023</div><p>{h.founded(stats.years)}</p></div>
            <div className="card team-mini" data-reveal="" data-delay=".08">
              <svg className="team-icon" viewBox="0 0 120 64" fill="none" strokeWidth="5.5" strokeLinecap="round" aria-hidden="true">
                <path className="ti-link" d="M20 12 Q60 -14 100 12" />
                <g className="ti-p ti-l"><circle cx="30" cy="22" r="8" /><path d="M14 54c0-9 7-15 16-15s16 6 16 15" /></g>
                <g className="ti-p ti-r"><circle cx="90" cy="22" r="8" /><path d="M74 54c0-9 7-15 16-15s16 6 16 15" /></g>
                <g className="ti-p ti-c"><circle cx="60" cy="18" r="10" /><path d="M40 58c0-11 9-19 20-19s20 8 20 19" /></g>
                <circle className="ti-dot" cx="60" cy="-1" r="4" />
              </svg>
              <p>{h.team(stats.team)}</p>
            </div>
            <div className="card b-wide" data-reveal="" data-delay=".16"><div className="stat-num">0 <span className="stat-accent">{h.uspWord}</span></div><p>{h.uspText}</p></div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div><Eyebrow>{h.worksEyebrow}</Eyebrow><Split text={h.worksTitle} /></div>
            <Btn href={to("/portfolio")} variant="ghost" arrow reveal>{h.allProjects}</Btn>
          </div>
          <div className="works">{projects.map((p, i) => <WorkCard key={p.id} p={p} lang={lang} size={HOME_SIZES[i]} delay={(i % 3) * 0.1} />)}</div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head"><div><Eyebrow>{h.servicesEyebrow}</Eyebrow><Split text={h.servicesTitle} /></div></div>
          <div className="services-list" data-stagger="">
            {SERVICES.map((s, i) => (
              <Link href={to(`/xizmatlar#${s.id}`)} className="service-row" key={s.id}>
                <span className="num">0{i + 1}</span><h3>{t.services.items[s.id].title}</h3><p>{t.services.items[s.id].short}</p><span className="go"><Arrow className="" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      {clients.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head"><div><Eyebrow>{h.partnersEyebrow}</Eyebrow><Split text={h.partnersTitle} /></div></div>
            <div className="partners" data-reveal="fade">
              {clients.map((cl) => {
                const inner = cl.logo ? <img src={cl.logo} alt={cl.name} /> : <span>{cl.name}</span>;
                return cl.url ? <a key={cl.id} className="partner" href={cl.url} target="_blank" rel="noopener noreferrer">{inner}</a> : <div key={cl.id} className="partner">{inner}</div>;
              })}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {c.testimonials.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container testi-wrap">
            <div className="section-head"><div><Eyebrow>{h.testiEyebrow}</Eyebrow><Split text={h.testiTitle} /></div></div>
            <Testimonials items={byOrder(c.testimonials).map((x) => loc(x, lang))} />
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container faq-layout">
          <div>
            <Eyebrow>{h.faqEyebrow}</Eyebrow>
            <Split text={h.faqTitle} style={{ marginTop: 14 }} />
            <p className="lead" data-reveal="" style={{ marginTop: 20 }}>{h.faqLead}</p>
            <div style={{ marginTop: 28 }}><Btn href={to("/aloqa")} variant="ghost" reveal>{h.faqAsk}</Btn></div>
          </div>
          <FaqList items={byOrder(c.faq).map((x) => loc(x, lang))} />
        </div>
      </section>

      <CtaBox lang={lang} eyebrow={h.ctaEyebrow} title={h.ctaTitle} button={h.ctaButton} />
    </>
  );
}
