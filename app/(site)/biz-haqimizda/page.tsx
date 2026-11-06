import type { Metadata } from "next";
import { byOrder, readContent } from "@/lib/store";
import { CtaBox, Eyebrow, PageHero, Split, initials } from "@/components/site/ui";
import { Count } from "@/components/site/client";

export const metadata: Metadata = { title: "Biz haqimizda" };

const VALUES = [
  ["Ijodkorlik", "Shablonlarsiz ishlaymiz. Har bir brend o'z ovoziga ega bo'lishi kerak.", "M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"],
  ["Muddatga sodiqlik", "Kelishilgan vaqtda topshiramiz. Kechiksak — chegirma beramiz.", "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 3"],
  ["Shaffoflik", "Har hafta hisobot va demo. Pulingiz nimaga ketayotganini doim bilasiz.", "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z"],
];
const TIMELINE = [
  ["2023", "Boshlanish", "Kichik jamoa sifatida birinchi lending sahifalar va brending loyihalarini yaratishni boshladik."],
  ["2024", "Birinchi yirik mijozlar", "Redmar uchun brend va CRM tizimi, Highline va Maktab TOP loyihalari — jamoa kengaydi."],
  ["2025", "Mobil yo'nalish va 100+ loyiha", "Mobil ilovalar bo'limini ochdik va Logitech UZ bilan hamkorlik qildik."],
  ["2026", "Xalqaro bozor", "Qozog'iston va BAA'dagi mijozlar uchun mahsulotlar yaratyapmiz. Keyingisi — sizning loyihangiz."],
]

export default async function AboutPage() {
  const content = await readContent();
  const s = content.settings.stats;
  const team = byOrder(content.team);
  return (
    <>
      <PageHero crumb="Biz haqimizda" title="Biz — *ABD Group*|raqamli studiya" lead={`2023-yilda kichik jamoa sifatida boshlaganmiz. Bugun ${s.team}+ mutaxassis O'zbekiston va xorijdagi brendlar uchun mahsulot yaratadi.`} />
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="stats" data-stagger="">
            <div className="card"><div className="stat-num"><Count value={s.years} /><sup>yil</sup></div><p>Bozordagi tajriba</p></div>
            <div className="card"><div className="stat-num"><Count value={s.projects} /><sup>+</sup></div><p>Loyihalar</p></div>
            <div className="card"><div className="stat-num"><Count value={s.team} /><sup>+</sup></div><p>Jamoa a&apos;zolari</p></div>
            <div className="card"><div className="stat-num"><Count value={s.clients} /><sup>+</sup></div><p>Doimiy mijozlar</p></div>
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head"><div><Eyebrow>Qadriyatlar</Eyebrow><Split text="Bizni nima|harakatlantiradi" /></div></div>
          <div className="values" data-stagger="">
            {VALUES.map(([t, d, icon]) => (
              <div className="card" key={t}><div className="svc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d={icon} /></svg></div><h3>{t}</h3><p>{d}</p></div>
            ))}
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head"><div><Eyebrow>Tarix</Eyebrow><Split text="Bizning yo'limiz" /></div></div>
          <div className="timeline">
            <span className="progress" />
            {TIMELINE.map(([y, t, d]) => <div className="tl-item" data-reveal="left" key={y}><span className="yr">{y}</span><div><h3>{t}</h3><p>{d}</p></div></div>)}
          </div>
        </div>
      </section>
      {team.length > 0 && <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head"><div><Eyebrow>Jamoa</Eyebrow><Split text="Kuchli|jamoamiz" /></div></div>
          <div className="team" data-stagger="">
            {team.map((m) => (
              <div className="card member" key={m.id}>
                <div className="member-photo" style={{ background: m.color }}>
                  {m.photo ? <img src={m.photo} alt={m.name} loading="lazy" /> : <b>{initials(m.name)}</b>}
                </div>
                <div className="member-info"><h4>{m.name}</h4><span>{m.role}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>}
      <CtaBox eyebrow="Biz bilan ishlang" title="Jamoamizga qo'shilmoqchimisiz yoki *loyiha bormi?*" button="Yozing" />
    </>
  );
}
