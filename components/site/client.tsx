"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import type { ActionState, Faq, Project, Testimonial } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { LANG_LABELS, LANGS, lp, splitPath } from "@/lib/i18n";
import { dict } from "@/lib/dict";
import { Roll, WorkCard } from "./ui";
import { submitContact, subscribe } from "@/app/(site)/actions";

/** Current language, read from the URL (/ru/…, /en/…, otherwise Uzbek). */
export function useLang() {
  const { lang, path } = splitPath(usePathname());
  return { lang, path, t: dict(lang), to: (p: string) => lp(lang, p) };
}

const NAV = [
  { href: "/", key: "home" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/xizmatlar", key: "services" },
  { href: "/biz-haqimizda", key: "about" },
  { href: "/aloqa", key: "contact" },
] as const;

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href) || (href === "/portfolio" && path.startsWith("/proyekt")));

/* ---------- header + mobile menu ---------- */
export function Header() {
  const { lang, path, t, to } = useLang();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setOpen(false); setLangOpen(false); }, [path, lang]);
  // the root layout only sets <html lang> on a full load; keep it right on client-side switches
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setLangOpen(false); } };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    if (!langOpen) return;
    const away = (e: PointerEvent) => { if (!langRef.current?.contains(e.target as Node)) setLangOpen(false); };
    addEventListener("pointerdown", away);
    return () => removeEventListener("pointerdown", away);
  }, [langOpen]);

  const langLinks = (className: string) =>
    LANGS.map((l) => (
      <Link key={l} href={lp(l, path)} hrefLang={l} lang={l} className={`${className}${l === lang ? " active" : ""}`} aria-current={l === lang ? "true" : undefined}>
        <b>{l.toUpperCase()}</b><span>{LANG_LABELS[l]}</span>
      </Link>
    ));

  return (
    <>
      <header className="site-header">
        <div className="container">
          <nav className="nav" aria-label={t.nav.mainMenu}>
            <Link href={to("/")} className="logo" aria-label={t.nav.logoHome}>
              <img src="/img/logo.svg" alt="ABD Group" width={58} height={30} />
            </Link>
            <ul className="nav-links">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={to(n.href)} className={isActive(path, n.href) ? "active" : ""}><Roll>{t.nav[n.key]}</Roll></Link>
                </li>
              ))}
            </ul>
            <div className="nav-actions">
              <div className={`lang-switch${langOpen ? " open" : ""}`} ref={langRef}>
                <button className="lang-btn" type="button" aria-haspopup="true" aria-expanded={langOpen} aria-label={t.nav.language} onClick={() => setLangOpen((o) => !o)}>
                  {lang.toUpperCase()}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                </button>
                <div className="lang-menu">{langLinks("lang-opt")}</div>
              </div>
              <Link href={to("/aloqa")} className="btn btn-primary btn-sm"><Roll>{t.nav.start}</Roll></Link>
              <button className="burger" type="button" aria-label={open ? t.nav.closeMenu : t.nav.openMenu} aria-expanded={open} onClick={() => setOpen((o) => !o)}><span /><span /></button>
            </div>
          </nav>
        </div>
      </header>
      <div className="mobile-menu" aria-hidden={!open}>
        {NAV.map((n) => (
          <Link key={n.href} href={to(n.href)} className={isActive(path, n.href) ? "active" : ""} tabIndex={open ? 0 : -1}>{t.nav[n.key]}</Link>
        ))}
        <div className="mobile-langs">{langLinks("m-lang")}</div>
      </div>
    </>
  );
}

/* ---------- animated counter ---------- */
export function Count({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / 1800);
        setN(Math.round(value * (1 - Math.pow(1 - p, 4))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  return <span ref={ref}>{n}</span>;
}

/* ---------- FAQ accordion ---------- */
export function FaqList({ items }: { items: Faq[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="faq">
      {items.map((f, i) => (
        <div key={f.id} data-reveal="" style={{ transitionDelay: `${i * 0.08}s` }}>
        <div className={`faq-item${open === f.id ? " open" : ""}`}>
          <button className="faq-q" type="button" aria-expanded={open === f.id} onClick={() => setOpen(open === f.id ? null : f.id)}>
            {f.question}<span className="ic" />
          </button>
          <div className="faq-a"><div><p>{f.answer}</p></div></div>
        </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- testimonials slider ---------- */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const { t } = useLang();
  const track = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [per, setPer] = useState(3);
  const max = Math.max(0, items.length - per);

  useEffect(() => {
    const fit = () => setPer(innerWidth <= 680 ? 1 : innerWidth <= 1024 ? 2 : 3);
    fit();
    addEventListener("resize", fit);
    return () => removeEventListener("resize", fit);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i >= max ? 0 : i + 1)), 5000);
    return () => clearInterval(t);
  }, [max, idx]);

  const go = (i: number) => setIdx(i < 0 ? max : i > max ? 0 : i);
  const first = track.current?.children[0] as HTMLElement | undefined;
  const step = first ? first.getBoundingClientRect().width + 16 : 0;
  const sx = useRef<number | null>(null);

  return (
    <>
      <div style={{ overflow: "hidden" }} data-reveal="">
        <div
          className="testi-track"
          ref={track}
          style={{ transform: `translateX(${-Math.min(idx, max) * step}px)` }}
          onPointerDown={(e) => (sx.current = e.clientX)}
          onPointerUp={(e) => { if (sx.current === null) return; const dx = e.clientX - sx.current; if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1)); sx.current = null; }}
        >
          {items.map((t) => (
            <div className="card testi" key={t.id}>
              <blockquote>“{t.text}”</blockquote>
              <div className="person">
                <span className="av" style={{ background: t.color }}>{t.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}</span>
                <div><b>{t.name}</b><small>{t.role}</small></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="testi-nav">
        <button className="round-btn" type="button" aria-label={t.testi.prev} onClick={() => go(idx - 1)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg></button>
        <div className="dots">{Array.from({ length: max + 1 }, (_, i) => <button key={i} type="button" aria-label={`${t.testi.slide} ${i + 1}`} className={i === Math.min(idx, max) ? "active" : ""} onClick={() => go(i)} />)}</div>
        <button className="round-btn" type="button" aria-label={t.testi.next} onClick={() => go(idx + 1)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg></button>
      </div>
    </>
  );
}

/* ---------- portfolio grid with filters ---------- */
const SIZES = ["w-5 tall", "w-7", "w-7", "w-5", "w-4", "w-4", "w-4", "w-7", "w-5", "w-6", "w-6", "w-12"];
export function PortfolioGrid({ projects }: { projects: Project[] }) {
  const { lang, t } = useLang();
  const [cat, setCat] = useState<string>("all");
  const [gen, setGen] = useState(0);
  const shown = cat === "all" ? projects : projects.filter((p) => p.category === cat);
  return (
    <>
      <div className="filters" role="toolbar" aria-label={t.portfolio.filterLabel} data-reveal="">
        {["all", ...CATEGORIES].map((c) => (
          <button key={c} type="button" className={`filter${cat === c ? " active" : ""}`} onClick={() => { setCat(c); setGen((g) => g + 1); }}>
            {t.categories[c as keyof typeof t.categories]}
          </button>
        ))}
      </div>
      <div className="works" key={gen}>
        {shown.map((p, i) => (
          // after a filter click the cards are new DOM nodes: show them right away with a pop-in
          <WorkCard key={p.id} p={p} lang={lang} size={`${SIZES[i % SIZES.length]}${gen ? " in pop" : ""}`} delay={gen ? 0 : (i % 3) * 0.1} />
        ))}
        {!shown.length && <p className="empty-note">{t.portfolio.empty}</p>}
      </div>
    </>
  );
}

/* ---------- contact form ---------- */
export function ContactForm({ services }: { services: { value: string; label: string }[] }) {
  const { lang, t } = useLang();
  const f = t.form;
  const [state, action, pending] = useActionState<ActionState, FormData>(submitContact, null);
  if (state?.ok)
    return (
      <div className="card form">
        <div className="form-success" style={{ display: "block" }}>
          <div className="check"><svg width="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg></div>
          <h3 className="h-2">{f.thanks}</h3>
          <p className="lead" style={{ margin: "12px auto 0" }}>{state.message}</p>
        </div>
      </div>
    );
  return (
    <form className="card form" action={action} data-reveal="" data-delay=".1">
      <input type="hidden" name="lang" value={lang} />
      <h2 className="h-2">{f.title}</h2>
      <div>
        <span className="form-label">{f.need}</span>
        <div className="chips">
          {services.map((s, i) => (
            <span key={s.value}><input type="checkbox" id={`c${i}`} name="services" value={s.label} /><label htmlFor={`c${i}`}>{s.label}</label></span>
          ))}
        </div>
      </div>
      <div className="form-row">
        <div className="field"><input id="f-name" name="name" required placeholder=" " autoComplete="name" maxLength={120} /><label htmlFor="f-name">{f.name}</label></div>
        <div className="field"><input id="f-phone" name="phone" type="tel" required placeholder=" " autoComplete="tel" maxLength={40} /><label htmlFor="f-phone">{f.phone}</label></div>
      </div>
      <div className="field"><input id="f-email" name="email" type="email" placeholder=" " autoComplete="email" maxLength={160} /><label htmlFor="f-email">{f.email}</label></div>
      <div>
        <span className="form-label">{f.budget}</span>
        <div className="chips">
          {f.budgets.map((b, i) => (
            <span key={b}><input type="radio" id={`b${i}`} name="budget" value={b} /><label htmlFor={`b${i}`}>{b}</label></span>
          ))}
        </div>
      </div>
      <div className="field"><textarea id="f-msg" name="text" placeholder=" " maxLength={4000} /><label htmlFor="f-msg">{f.message}</label></div>
      {/* honeypot: real people never see or fill this */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px" }} aria-hidden="true" />
      {state && !state.ok && <p className="form-error" role="alert">{state.message}</p>}
      <button className="btn btn-primary" type="submit" style={{ justifySelf: "start" }} disabled={pending}><Roll>{pending ? f.sending : f.send}</Roll></button>
    </form>
  );
}

/* ---------- footer newsletter ---------- */
export function Newsletter() {
  const { lang, t } = useLang();
  const [state, action, pending] = useActionState<ActionState, FormData>(subscribe, null);
  useEffect(() => { if (state?.message) window.abdToast?.(state.message); }, [state]);
  return (
    <form action={action} key={state?.ok ? "sent" : "form"}>
      <input type="hidden" name="lang" value={lang} />
      <input type="email" name="email" required placeholder="example@gmail.com" aria-label="Email" maxLength={160} />
      <button className="btn btn-primary btn-sm" type="submit" disabled={pending}>{t.footer.send}</button>
    </form>
  );
}

declare global {
  interface Window { abdToast?: (msg: string) => void }
}

/* ---------- footer wordmark: the letter under the pointer/finger glows ---------- */
export function FooterWord({ text }: { text: string }) {
  const [on, setOn] = useState(-1);
  const pick = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const i = el?.dataset.i;
    setOn(i === undefined ? -1 : Number(i));
  };
  return (
    <div
      className="footer-big"
      aria-hidden="true"
      onPointerMove={(e) => pick(e.clientX, e.clientY)}
      onPointerDown={(e) => pick(e.clientX, e.clientY)}
      onTouchMove={(e) => { const t = e.touches[0]; if (t) pick(t.clientX, t.clientY); }}
      onPointerLeave={() => setOn(-1)}
      onTouchEnd={() => setOn(-1)}
    >
      {[...text].map((ch, i) =>
        ch === " " ? " " : (
          <span key={i} data-i={i} className={i === on ? "on" : Math.abs(i - on) === 1 && on >= 0 ? "near" : undefined}>{ch}</span>
        ),
      )}
    </div>
  );
}
