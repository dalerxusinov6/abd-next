"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import type { ActionState, Faq, Project, Testimonial } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORIES } from "@/lib/types";
import { Roll, WorkCard } from "./ui";
import { submitContact, subscribe } from "@/app/(site)/actions";

export const NAV = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/xizmatlar", label: "Xizmatlar" },
  { href: "/biz-haqimizda", label: "Biz haqimizda" },
  { href: "/aloqa", label: "Aloqa" },
];

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href) || (href === "/portfolio" && path.startsWith("/proyekt")));

/* ---------- header + mobile menu ---------- */
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("UZ");
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="site-header">
        <div className="container">
          <nav className="nav" aria-label="Asosiy menyu">
            <Link href="/" className="logo" aria-label="ABD Group bosh sahifa">
              <img src="/img/logo.svg" alt="ABD Group" width={58} height={30} />
            </Link>
            <ul className="nav-links">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className={isActive(path, n.href) ? "active" : ""}><Roll>{n.label}</Roll></Link>
                </li>
              ))}
            </ul>
            <div className="nav-actions">
              <button className="lang-btn" type="button" onClick={() => { const l = ["UZ", "RU", "EN"]; const next = l[(l.indexOf(lang) + 1) % 3]; setLang(next); window.abdToast?.(`Til: ${next} (demo)`); }}>{lang}</button>
              <Link href="/aloqa" className="btn btn-primary btn-sm"><Roll>Loyiha boshlash</Roll></Link>
              <button className="burger" type="button" aria-label={open ? "Menyuni yopish" : "Menyuni ochish"} aria-expanded={open} onClick={() => setOpen((o) => !o)}><span /><span /></button>
            </div>
          </nav>
        </div>
      </header>
      <div className="mobile-menu" aria-hidden={!open}>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={isActive(path, n.href) ? "active" : ""} tabIndex={open ? 0 : -1}>{n.label}</Link>
        ))}
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
        <div key={f.id} className={`faq-item${open === f.id ? " open" : ""}`} data-reveal="" style={{ transitionDelay: `${i * 0.08}s` }}>
          <button className="faq-q" type="button" aria-expanded={open === f.id} onClick={() => setOpen(open === f.id ? null : f.id)}>
            {f.question}<span className="ic" />
          </button>
          <div className="faq-a"><div><p>{f.answer}</p></div></div>
        </div>
      ))}
    </div>
  );
}

/* ---------- testimonials slider ---------- */
export function Testimonials({ items }: { items: Testimonial[] }) {
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
              <div className="stars">★★★★★</div>
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
        <button className="round-btn" type="button" aria-label="Oldingi" onClick={() => go(idx - 1)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg></button>
        <div className="dots">{Array.from({ length: max + 1 }, (_, i) => <button key={i} type="button" aria-label={`Slayd ${i + 1}`} className={i === Math.min(idx, max) ? "active" : ""} onClick={() => go(i)} />)}</div>
        <button className="round-btn" type="button" aria-label="Keyingi" onClick={() => go(idx + 1)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg></button>
      </div>
    </>
  );
}

/* ---------- portfolio grid with filters ---------- */
const SIZES = ["w-5 tall", "w-7", "w-7", "w-5", "w-4", "w-4", "w-4", "w-7", "w-5", "w-6", "w-6", "w-12"];
export function PortfolioGrid({ projects }: { projects: Project[] }) {
  const [cat, setCat] = useState<string>("all");
  const [gen, setGen] = useState(0);
  const shown = cat === "all" ? projects : projects.filter((p) => p.category === cat);
  return (
    <>
      <div className="filters" role="toolbar" aria-label="Kategoriya" data-reveal="">
        {["all", ...CATEGORIES].map((c) => (
          <button key={c} type="button" className={`filter${cat === c ? " active" : ""}`} onClick={() => { setCat(c); setGen((g) => g + 1); }}>
            {c === "all" ? "Barchasi" : CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS]}
          </button>
        ))}
      </div>
      <div className="works" key={gen}>
        {shown.map((p, i) => (
          // after a filter click the cards are new DOM nodes: show them right away with a pop-in
          <WorkCard key={p.id} p={p} size={`${SIZES[i % SIZES.length]}${gen ? " in pop" : ""}`} delay={gen ? 0 : (i % 3) * 0.1} />
        ))}
        {!shown.length && <p className="empty-note">Bu toifada hozircha loyiha yo'q.</p>}
      </div>
    </>
  );
}

/* ---------- contact form ---------- */
export function ContactForm({ services }: { services: { value: string; label: string }[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(submitContact, null);
  if (state?.ok)
    return (
      <div className="card form">
        <div className="form-success" style={{ display: "block" }}>
          <div className="check"><svg width="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg></div>
          <h3 className="h-2">Rahmat!</h3>
          <p className="lead" style={{ margin: "12px auto 0" }}>{state.message}</p>
        </div>
      </div>
    );
  return (
    <form className="card form" action={action} data-reveal="" data-delay=".1">
      <h2 className="h-2">Loyiha haqida</h2>
      <div>
        <span className="form-label">Sizga nima kerak?</span>
        <div className="chips">
          {services.map((s, i) => (
            <span key={s.value}><input type="checkbox" id={`c${i}`} name="services" value={s.label} /><label htmlFor={`c${i}`}>{s.label}</label></span>
          ))}
        </div>
      </div>
      <div className="form-row">
        <div className="field"><input id="f-name" name="name" required placeholder=" " autoComplete="name" maxLength={120} /><label htmlFor="f-name">Ismingiz</label></div>
        <div className="field"><input id="f-phone" name="phone" type="tel" required placeholder=" " autoComplete="tel" maxLength={40} /><label htmlFor="f-phone">Telefon raqam</label></div>
      </div>
      <div className="field"><input id="f-email" name="email" type="email" placeholder=" " autoComplete="email" maxLength={160} /><label htmlFor="f-email">Email (ixtiyoriy)</label></div>
      <div>
        <span className="form-label">Taxminiy byudjet</span>
        <div className="chips">
          {["$1k gacha", "$1k – $5k", "$5k – $15k", "$15k+"].map((b, i) => (
            <span key={b}><input type="radio" id={`b${i}`} name="budget" value={b} /><label htmlFor={`b${i}`}>{b}</label></span>
          ))}
        </div>
      </div>
      <div className="field"><textarea id="f-msg" name="text" placeholder=" " maxLength={4000} /><label htmlFor="f-msg">Loyiha haqida qisqacha</label></div>
      {/* honeypot: real people never see or fill this */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px" }} aria-hidden="true" />
      {state && !state.ok && <p className="form-error" role="alert">{state.message}</p>}
      <button className="btn btn-primary" type="submit" style={{ justifySelf: "start" }} disabled={pending}><Roll>{pending ? "Yuborilmoqda…" : "Yuborish"}</Roll></button>
    </form>
  );
}

/* ---------- footer newsletter ---------- */
export function Newsletter() {
  const [state, action, pending] = useActionState<ActionState, FormData>(subscribe, null);
  useEffect(() => { if (state?.message) window.abdToast?.(state.message); }, [state]);
  return (
    <form action={action} key={state?.ok ? "sent" : "form"}>
      <input type="email" name="email" required placeholder="example@gmail.com" aria-label="Email" maxLength={160} />
      <button className="btn btn-primary btn-sm" type="submit" disabled={pending}>Yuborish</button>
    </form>
  );
}

declare global {
  interface Window { abdToast?: (msg: string) => void }
}
