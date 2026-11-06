import type { Metadata } from "next";
import { byOrder, readContent } from "@/lib/store";
import { Eyebrow, PageHero, Split } from "@/components/site/ui";
import { ContactForm, FaqList } from "@/components/site/client";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = { title: "Aloqa" };

export default async function ContactPage() {
  const c = await readContent();
  const s = c.settings;
  const tg = s.telegram.replace(/^@/, "");
  const options = [...SERVICES.map((x) => ({ value: x.id, label: x.title })), { value: "mobile", label: "Mobil ilova" }];

  return (
    <>
      <PageHero crumb="Aloqa" title="Keling,|*gaplashamiz*" lead="Loyihangiz haqida bir necha so'z yozing — 24 soat ichida bog'lanamiz va bepul baholab beramiz." />
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container contact-layout">
          <div className="contact-side">
            <div className="contact-info" data-stagger="">
              <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="card"><span className="svc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg></span><div><small>Telefon</small><b>{s.phone}</b></div></a>
              <a href={`mailto:${s.email}`} className="card"><span className="svc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="3" /><path d="m22 7-10 6L2 7" /></svg></span><div><small>Email</small><b>{s.email}</b></div></a>
              {tg && <a href={`https://t.me/${tg}`} target="_blank" rel="noopener noreferrer" className="card"><span className="svc-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 18.7 19.4c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.2-8.3c.4-.4-.1-.5-.6-.2L6.2 13.1l-4.9-1.5c-1.1-.3-1.1-1 .2-1.5L20.4 2.8c.9-.3 1.7.2 1.5 1.5z" /></svg></span><div><small>Telegram</small><b>@{tg}</b></div></a>}
            </div>
            <div className="card map-card" data-reveal="">
              <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <defs><pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0v20" fill="none" stroke="rgba(255,255,255,.05)" /></pattern></defs>
                <rect width="400" height="320" fill="url(#g)" />
                <path d="M-10 200 Q100 150 200 170 T420 120" stroke="rgba(0,200,255,.25)" strokeWidth="14" fill="none" />
                <path d="M120 -10 L160 330" stroke="rgba(255,255,255,.08)" strokeWidth="10" />
                <path d="M-10 80 L410 110" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
                <path d="M300 -10 L260 330" stroke="rgba(255,255,255,.06)" strokeWidth="6" />
              </svg>
              <div className="map-pin"><span>ABD Group · {s.address}</span><i /></div>
            </div>
          </div>
          <ContactForm services={options} />
        </div>
      </section>

      <section className="section" id="faq" style={{ paddingTop: 0 }}>
        <div className="container faq-layout">
          <div><Eyebrow>FAQ</Eyebrow><Split text="Savollar|va javoblar" style={{ marginTop: 14 }} /></div>
          <FaqList items={byOrder(c.faq)} />
        </div>
      </section>
    </>
  );
}
