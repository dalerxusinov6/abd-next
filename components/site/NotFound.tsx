"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useLang } from "./client";
import { Arrow, Roll, Split } from "./ui";

/*
 * 404: a big outlined "4 0 4" whose "0" is an eye looking for the lost page.
 * The pupil follows the pointer (or finger); left alone, it looks around by
 * itself and blinks now and then. The 4s drift slightly against the pointer.
 */
export default function NotFound() {
  const { t, to } = useLang();
  const n = t.notFound;
  const stage = useRef<HTMLDivElement>(null);
  const pupil = useRef<HTMLSpanElement>(null);
  const eye = useRef<HTMLSpanElement>(null);

  // the layout's metadata wins over not-found's once the page streams in
  useEffect(() => { document.title = `${n.eyebrow} — ABD Group`; }, [n.eyebrow]);

  useEffect(() => {
    const el = stage.current, p = pupil.current, e = eye.current;
    if (!el || !p || !e) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tx = 0, ty = 0, x = 0, y = 0, lastMove = 0, raf = 0;

    // target as -1…1 inside the eye
    const aim = (cx: number, cy: number) => {
      const r = e.getBoundingClientRect();
      const dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 220);
      tx = (dx / d) * k; ty = (dy / d) * k;
      lastMove = performance.now();
    };
    const onMove = (ev: PointerEvent) => aim(ev.clientX, ev.clientY);
    const onTouch = (ev: TouchEvent) => { const p0 = ev.touches[0]; if (p0) aim(p0.clientX, p0.clientY); };

    // idle: glance somewhere new every ~1.6s, as if searching
    const wander = setInterval(() => {
      if (performance.now() - lastMove < 2200) return;
      const a = Math.random() * Math.PI * 2, k = 0.45 + Math.random() * 0.55;
      tx = Math.cos(a) * k; ty = Math.sin(a) * k * 0.8;
    }, 1600);

    const blink = setInterval(() => {
      if (reduced) return;
      e.classList.add("blink");
      setTimeout(() => e.classList.remove("blink"), 180);
    }, 3800);

    const tick = () => {
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      const r = e.clientWidth;
      p.style.transform = `translate(${x * r * 0.26}px, ${y * r * 0.3}px)`;
      el.style.setProperty("--px", String(-x));
      el.style.setProperty("--py", String(-y));
      raf = requestAnimationFrame(tick);
    };
    if (!reduced) raf = requestAnimationFrame(tick);

    addEventListener("pointermove", onMove);
    addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      cancelAnimationFrame(raf); clearInterval(wander); clearInterval(blink);
      removeEventListener("pointermove", onMove); removeEventListener("touchmove", onTouch);
    };
  }, []);

  const links = [
    { href: "/xizmatlar", label: t.nav.services },
    { href: "/biz-haqimizda", label: t.nav.about },
    { href: "/aloqa", label: t.nav.contact },
  ];

  return (
    <section className="nf">
      <canvas className="dot-field" aria-hidden="true" />
      <div className="container nf-inner">
        <div className="nf-stage" ref={stage} aria-hidden="true">
          <span className="nf-digit">4</span>
          <span className="nf-eye" ref={eye}>
            <span className="nf-lid" />
            <span className="nf-pupil" ref={pupil}><i /></span>
          </span>
          <span className="nf-digit">4</span>
        </div>
        <span className="eyebrow" data-reveal="">{n.eyebrow}</span>
        <Split as="h1" className="h-1 nf-title" text={n.title} />
        <p className="lead" data-reveal="" data-delay=".2">{n.lead}</p>
        <div className="hero-cta" data-reveal="" data-delay=".3">
          <Link href={to("/")} className="btn btn-primary"><Roll>{n.home}</Roll><Arrow /></Link>
          <Link href={to("/portfolio")} className="btn btn-ghost"><Roll>{n.works}</Roll></Link>
        </div>
        <div className="nf-links" data-reveal="" data-delay=".4">
          <small>{n.popular}</small>
          {links.map((l) => <Link key={l.href} href={to(l.href)}>{l.label}</Link>)}
        </div>
      </div>
    </section>
  );
}
