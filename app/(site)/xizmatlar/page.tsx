import type { Metadata } from "next";
import { CtaBox, Eyebrow, PageHero, Split } from "@/components/site/ui";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = { title: "Xizmatlar" };

const STEPS = [
  ["Tanishuv", "Maqsad, auditoriya va raqobatchilarni o'rganamiz. Aniq texnik topshiriq tuzamiz."],
  ["Dizayn", "Wireframe va vizual konsepsiya. Siz bilan kelishib, har bir ekranni sayqallaymiz."],
  ["Dasturlash", "Toza kod, testlar va har hafta demo. Jarayonni real vaqtda kuzatasiz."],
  ["Ishga tushirish", "Deploy, o'qitish va 3 oy bepul texnik yordam. Keyin ham yoningizdamiz."],
];

export default function ServicesPage() {
  return (
    <>
      <PageHero crumb="Xizmatlar" title="G'oyadan|*ishga tushirishgacha*" lead="To'rt yo'nalish, bitta jamoa. Har bir xizmat sizning biznes maqsadingizga moslab quriladi." />
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="svc-grid">
            {SERVICES.map((s, i) => (
              <article className="card svc-card" id={s.id} key={s.id} data-reveal="" data-delay={i % 2 ? ".1" : undefined} data-tilt="">
                <div className="svc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg></div>
                <h2 className="h-2">{s.title}</h2>
                <p>{s.text}</p>
                <ul>{s.tags.map((t) => <li key={t}>{t}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head"><div><Eyebrow>Jarayon</Eyebrow><Split text="Qanday|ishlaymiz" /></div></div>
          <div className="process" data-stagger="">
            {STEPS.map(([t, d]) => <div className="card step" key={t}><h4>{t}</h4><p>{d}</p></div>)}
          </div>
        </div>
      </section>
      <CtaBox eyebrow="Bepul konsultatsiya" title="Qaysi xizmat kerakligini *birga aniqlaymiz*" button="Konsultatsiya olish" />
    </>
  );
}
