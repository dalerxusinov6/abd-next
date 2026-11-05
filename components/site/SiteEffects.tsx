"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/*
 * All DOM-level motion of the public site: page curtain, header hide,
 * cursor ring, scroll reveals, dot fields, parallax, magnetic buttons.
 * Global listeners mount once; per-page work re-runs on every route change.
 */
export default function SiteEffects() {
  const path = usePathname();
  const router = useRouter();
  const first = useRef(true);

  /* ---------- once: curtain, link interception, header, cursor, toast ---------- */
  useEffect(() => {
    const body = document.body;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 900))]).then(() =>
      setTimeout(() => body.classList.add("is-loaded"), 150)
    );

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname.startsWith("/admin") || url.pathname.startsWith("/uploads")) return;
      if (url.pathname === location.pathname && url.search === location.search) {
        if (url.hash) return;
        e.preventDefault();
        return;
      }
      e.preventDefault();
      body.classList.remove("menu-open");
      body.classList.add("is-leaving");
      setTimeout(() => router.push(url.pathname + url.search + url.hash), reduced ? 0 : 720);
    };
    document.addEventListener("click", onClick, true);

    // header hide + to-top ring
    const header = document.querySelector(".site-header");
    const toTop = document.querySelector(".to-top");
    const ring = document.querySelector<SVGCircleElement>(".to-top circle");
    let lastY = 0;
    const onScroll = () => {
      const y = scrollY;
      header?.classList.toggle("is-hidden", y > 300 && y > lastY && !body.classList.contains("menu-open"));
      lastY = y;
      toTop?.classList.toggle("show", y > 600);
      const max = document.documentElement.scrollHeight - innerHeight;
      if (ring) ring.style.strokeDashoffset = String(150.8 * (1 - (max > 0 ? y / max : 0)));
    };
    addEventListener("scroll", onScroll, { passive: true });
    const goTop = () => scrollTo({ top: 0, behavior: "smooth" });
    toTop?.addEventListener("click", goTop);

    // toast
    let toastTimer: ReturnType<typeof setTimeout>;
    window.abdToast = (msg) => {
      const t = document.querySelector(".toast");
      if (!t) return;
      t.textContent = msg;
      t.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
    };

    // cursor ring
    const ringEl = document.querySelector<HTMLElement>(".cursor-ring");
    const fine = matchMedia("(pointer: fine)").matches;
    let raf = 0;
    const cleanups: (() => void)[] = [];
    if (ringEl && fine && !reduced) {
      let rx = innerWidth / 2, ry = innerHeight / 2, tx = rx, ty = ry;
      const loop = () => { rx += (tx - rx) * 0.18; ry += (ty - ry) * 0.18; ringEl.style.transform = `translate(${rx}px, ${ry}px)`; raf = requestAnimationFrame(loop); };
      loop();
      const move = (e: PointerEvent) => { tx = e.clientX; ty = e.clientY; ringEl.classList.remove("hidden"); };
      const over = (e: PointerEvent) => {
        const t = e.target as HTMLElement;
        const view = !!t.closest("[data-cursor=view]");
        ringEl.classList.toggle("view", view);
        ringEl.classList.toggle("hover", !view && !!t.closest("a, button, label, input, textarea, select"));
      };
      const leave = () => ringEl.classList.add("hidden");
      addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerover", over);
      document.addEventListener("pointerleave", leave);
      cleanups.push(() => { removeEventListener("pointermove", move); document.removeEventListener("pointerover", over); document.removeEventListener("pointerleave", leave); });
    }

    return () => {
      document.removeEventListener("click", onClick, true);
      removeEventListener("scroll", onScroll);
      toTop?.removeEventListener("click", goTop);
      cancelAnimationFrame(raf);
      cleanups.forEach((c) => c());
    };
  }, [router]);

  /* ---------- every page: reveals, dots, parallax, tilt, magnets, timeline ---------- */
  useEffect(() => {
    const body = document.body;
    if (!first.current) {
      body.classList.remove("is-leaving");
      body.classList.remove("menu-open");
    }
    first.current = false;

    const $$ = <T extends Element = HTMLElement>(s: string) => [...document.querySelectorAll<T>(s)];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(pointer: fine)").matches;
    const off: (() => void)[] = [];
    const on = <K extends keyof WindowEventMap>(t: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) => {
      addEventListener(t, fn, opts);
      off.push(() => removeEventListener(t, fn));
    };

    // reveal
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const t = en.target as HTMLElement;
        t.classList.add("in");
        io.unobserve(t);
        setTimeout(() => (t.style.transitionDelay = ""), 1600);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    $$("[data-reveal], [data-split]").forEach((el) => {
      if (el.dataset.delay) el.style.transitionDelay = el.dataset.delay + "s";
      io.observe(el);
    });
    $$("[data-stagger]").forEach((wrap) => {
      [...wrap.children].forEach((c, i) => { const el = c as HTMLElement; if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", ""); el.style.transitionDelay = i * 0.08 + "s"; io.observe(el); });
    });
    off.push(() => io.disconnect());

    // dot fields
    $$<HTMLCanvasElement>(".dot-field").forEach((cv) => {
      const ctx = cv.getContext("2d");
      const host = cv.parentElement;
      if (!ctx || !host) return;
      const GAP = 30;
      let w = 0, h = 0, mx = -999, my = -999, visible = true, t = 0, raf = 0;
      let pts: { x: number; y: number; ox: number; oy: number }[] = [];
      const size = () => {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        w = host.clientWidth; h = host.clientHeight;
        cv.width = w * dpr; cv.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        pts = [];
        for (let y = GAP / 2; y < h; y += GAP) for (let x = GAP / 2; x < w; x += GAP) pts.push({ x, y, ox: x, oy: y });
      };
      size();
      on("resize", size);
      const pm = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; };
      const pl = () => { mx = my = -999; };
      host.addEventListener("pointermove", pm);
      host.addEventListener("pointerleave", pl);
      const vis = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
      vis.observe(host);
      const draw = () => {
        raf = requestAnimationFrame(draw);
        if (!visible) return;
        t += reduced ? 0 : 0.012;
        ctx.clearRect(0, 0, w, h);
        for (const p of pts) {
          const wave = Math.sin(p.ox * 0.012 + p.oy * 0.008 + t * 2) * 0.5 + 0.5;
          const dx = p.ox - mx, dy = p.oy - my, d = Math.hypot(dx, dy), R = 150;
          let gx = p.ox, gy = p.oy, near = 0;
          if (d < R) { near = 1 - d / R; const f = near * 26; gx += (dx / (d || 1)) * f; gy += (dy / (d || 1)) * f; }
          p.x += (gx - p.x) * 0.12; p.y += (gy - p.y) * 0.12;
          const a = 0.08 + wave * 0.12 + near * 0.7;
          ctx.fillStyle = near > 0.05 ? `rgba(34,211,238,${a})` : `rgba(255,255,255,${a})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, 1.1 + near * 1.6, 0, 6.283); ctx.fill();
        }
      };
      draw();
      off.push(() => { cancelAnimationFrame(raf); vis.disconnect(); host.removeEventListener("pointermove", pm); host.removeEventListener("pointerleave", pl); });
    });

    // parallax inside project images
    if (!reduced) {
      const par = () => $$(".work .work-art, .p-gallery .work-art, .p-cover .work-art").forEach((a) => {
        const r = a.parentElement!.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        a.style.setProperty("--py", (-((r.top + r.height / 2 - innerHeight / 2) / innerHeight) * 40).toFixed(1) + "px");
      });
      on("scroll", par, { passive: true });
      par();
    }

    // tilt + magnetic buttons (desktop only)
    if (fine && !reduced) {
      $$("[data-tilt]").forEach((el) => {
        const m = (e: PointerEvent) => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; el.style.transform = `perspective(900px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`; };
        const l = () => (el.style.transform = "");
        el.addEventListener("pointermove", m); el.addEventListener("pointerleave", l);
        off.push(() => { el.removeEventListener("pointermove", m); el.removeEventListener("pointerleave", l); });
      });
      $$(".btn-primary, .round-btn").forEach((b) => {
        const m = (e: PointerEvent) => { const r = b.getBoundingClientRect(); b.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.18}px ${(e.clientY - r.top - r.height / 2) * 0.25}px`; };
        const l = () => (b.style.translate = "");
        b.addEventListener("pointermove", m); b.addEventListener("pointerleave", l);
        off.push(() => { b.removeEventListener("pointermove", m); b.removeEventListener("pointerleave", l); });
      });
    }

    // timeline progress
    const tl = document.querySelector<HTMLElement>(".timeline");
    if (tl) {
      const prog = tl.querySelector<HTMLElement>(".progress");
      const upd = () => { const r = tl.getBoundingClientRect(); prog?.style.setProperty("--p", Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height)) * 100 + "%"); };
      on("scroll", upd, { passive: true });
      upd();
    }

    return () => off.forEach((f) => f());
  }, [path]);

  return null;
}
