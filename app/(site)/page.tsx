import Link from "next/link";
import { byOrder, readContent } from "@/lib/store";
import { Arrow, Btn, CtaBox, Eyebrow, Split, WorkCard } from "@/components/site/ui";
import { Count, FaqList, Testimonials } from "@/components/site/client";
import { LogoParticles, Rotator } from "@/components/site/Hero";
import { SERVICES } from "@/lib/services";

const HOME_SIZES = ["w-5 tall", "w-7", "w-7", "w-5", "w-6", "w-6"];
const TECH = ["Figma", "React", "Next.js", "Python", "Flutter", "Node.js", "Laravel"];

export default async function Home() {
  const c = await readContent();
  const projects = byOrder(c.projects.filter((p) => p.published)).slice(0, 6);
  const clients = byOrder(c.clients);
  const { stats, heroWords } = c.settings;

  return (
    <>
      {/* HERO */}
      <section className="hero hero-v3">
        <canvas className="dot-field" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1 className="h-display hero-title">
              <span className="hl" data-reveal="">Biznesingiz</span>
              <span className="hl" data-reveal="" data-delay=".08">uchun</span>
              <span className="hl" data-reveal="" data-delay=".16"><Rotator words={heroWords.length ? heroWords : ["yechimlar"]} /></span>
              <span className="hl" data-reveal="" data-delay=".24">ishlab chiqamiz<i className="caret" aria-hidden="true" /></span>
            </h1>
            <p className="lead" data-reveal="" data-delay=".35">G&apos;oyadan ishga tushirishgacha — strategiya, dizayn va dasturlash bitta jamoada.</p>
            <div className="hero-cta" data-reveal="" data-delay=".45">
              <Btn href="/aloqa">Loyiha boshlash</Btn>
              <Btn href="/portfolio" variant="ghost">Ishlarimiz</Btn>
            </div>
          </div>
          <div className="hero-art" data-reveal="fade" data-delay=".2">
            <LogoParticles />
            <div className="art-frame" aria-hidden="true"><i /><i /><i /><i /></div>
            <div className="art-hint" aria-hidden="true"><span className="key">●</span> Sichqonchani yaqinlashtiring · bosing</div>
            <div className="spin-badge" aria-hidden="true">
              <svg className="ring" viewBox="0 0 110 110"><defs><path id="circ" d="M55,55 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0" /></defs><text><textPath href="#circ">ABD Group • Raqamli yechimlar • </textPath></text></svg>
              <span className="core"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg></span>
            </div>
          </div>
        </div>
        <div className="container hero-foot" data-stagger="">
          <div><b><Count value={stats.projects} /></b><span>+ loyiha</span></div>
          <div><b><Count value={stats.clients} /></b><span>+ doimiy mijoz</span></div>
          <div><b><Count value={stats.years} /></b><span>yil tajriba</span></div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee" aria-label="Texnologiyalar">
        <div className="marquee-track">
          {[...TECH, ...TECH].flatMap((t, i) => [<div className="marquee-item" key={`t${i}`}>{t}</div>, <div className="marquee-item" key={`s${i}`} aria-hidden="true">✦</div>])}
        </div>
      </div>

      {/* ABOUT */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div><Eyebrow>Biz haqimizda</Eyebrow><Split text="Kichik jamoa,|katta natijalar" /></div>
            <Btn href="/biz-haqimizda" variant="ghost" arrow reveal>Batafsil</Btn>
          </div>
          <div className="bento bento-3">
            <div className="card" data-reveal=""><div className="stat-num"><Count value={stats.projects} /><sup>+</sup></div><p>Muvaffaqiyatli yakunlangan loyihalar</p></div>
            <div className="card" data-reveal="" data-delay=".08"><div className="stat-num"><Count value={stats.clients} /><sup>+</sup></div><p>Biz bilan qayta ishlayotgan mijozlar</p></div>
            <div className="card" data-reveal="" data-delay=".16"><div className="stat-num">2023</div><p>Faoliyatimiz boshlangan yil — <Count value={stats.years} /> yillik tajriba</p></div>
            <div className="card team-mini" data-reveal="" data-delay=".08">
              <svg className="team-icon" viewBox="0 0 120 64" fill="none" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path className="ti-link" d="M20 12 Q60 -14 100 12" />
                <g className="ti-p ti-l"><circle cx="30" cy="22" r="8" /><path d="M14 54c0-9 7-15 16-15s16 6 16 15" /></g>
                <g className="ti-p ti-r"><circle cx="90" cy="22" r="8" /><path d="M74 54c0-9 7-15 16-15s16 6 16 15" /></g>
                <g className="ti-p ti-c"><circle cx="60" cy="18" r="10" /><path d="M40 58c0-11 9-19 20-19s20 8 20 19" /></g>
                <circle className="ti-dot" cx="60" cy="-1" r="2.6" />
              </svg>
              <p>{stats.team}+ dizayner, dasturchi va menejer</p>
            </div>
            <div className="card b-wide clients-mini" data-reveal="" data-delay=".16">
              <div className="client-row">{clients.slice(0, 6).map((cl) => (cl.logo ? <img key={cl.id} src={cl.logo} alt={cl.name} /> : <span key={cl.id}>{cl.name}</span>))}</div>
              <p>Eng katta mijozlarimiz va hamkorlarimiz bizga ishonadi</p>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div><Eyebrow>Portfolio</Eyebrow><Split text="Tanlangan|ishlarimiz" /></div>
            <Btn href="/portfolio" variant="ghost" arrow reveal>Barcha loyihalar</Btn>
          </div>
          <div className="works">{projects.map((p, i) => <WorkCard key={p.id} p={p} size={HOME_SIZES[i]} delay={(i % 3) * 0.1} />)}</div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head"><div><Eyebrow>Xizmatlar</Eyebrow><Split text="Nima bilan|yordam beramiz" /></div></div>
          <div className="services-list" data-stagger="">
            {SERVICES.map((s, i) => (
              <Link href={`/xizmatlar#${s.id}`} className="service-row" key={s.id}>
                <span className="num">0{i + 1}</span><h3>{s.title}</h3><p>{s.short}</p><span className="go"><Arrow className="" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      {clients.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head"><div><Eyebrow>Hamkorlar</Eyebrow><Split text="Bizga ishonganlar" /></div></div>
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
            <div className="section-head"><div><Eyebrow>Fikrlar</Eyebrow><Split text="Mijozlarimiz|nima deydi" /></div></div>
            <Testimonials items={byOrder(c.testimonials)} />
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container faq-layout">
          <div>
            <Eyebrow>Yordam</Eyebrow>
            <Split text="Ko'p beriladigan|savollar" style={{ marginTop: 14 }} />
            <p className="lead" data-reveal="" style={{ marginTop: 20 }}>Javob topa olmadingizmi? Bizga yozing — 15 daqiqa ichida javob beramiz.</p>
            <div style={{ marginTop: 28 }}><Btn href="/aloqa" variant="ghost" reveal>Savol berish</Btn></div>
          </div>
          <FaqList items={byOrder(c.faq)} />
        </div>
      </section>

      <CtaBox eyebrow="Keling, tanishamiz" title="Keyingi katta loyihangizni *birga* quramiz" button="Bog'lanish" />
    </>
  );
}
