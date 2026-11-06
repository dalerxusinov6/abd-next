"use client";

import { useEffect, useRef, useState } from "react";
import { canvasLoop } from "@/lib/perf";

/* Rotating word in the headline. Calls onChange so the logo can pulse. */
export function Rotator({ words }: { words: string[] }) {
  const [tick, setTick] = useState(0);
  const i = tick % words.length;
  const prev = tick > 0 ? (tick - 1) % words.length : null;
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const [width, setWidth] = useState<number | undefined>();

  useEffect(() => {
    const fit = () => setWidth(refs.current[i]?.offsetWidth);
    fit();
    document.fonts?.ready.then(fit);
    addEventListener("resize", fit);
    return () => removeEventListener("resize", fit);
  }, [i]);

  useEffect(() => {
    if (words.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      setTick((n) => n + 1);
      window.dispatchEvent(new Event("abd:pulse"));
    }, 2600);
    return () => clearInterval(t);
  }, [words.length]);

  return (
    <span className="rotator" aria-live="polite" style={{ width }}>
      {words.map((w, k) => (
        <span key={k} ref={(el) => { refs.current[k] = el; }} className={k === i ? "is-on" : k === prev ? "is-out" : ""}>{w}</span>
      ))}
    </span>
  );
}

/* ABD logo drawn as particles that assemble, flee the cursor and burst on click. */
export function LogoParticles() {
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = cv.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    type P = { tx: number; ty: number; x: number; y: number; vx: number; vy: number; c: string; s: number; ph: number; ease: number };
    let W = 0, H = 0, parts: P[] = [], visible = true, t = 0;
    const mouse = { x: -9999, y: -9999 };
    const img = new Image();

    const sample = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = host.clientWidth; H = host.clientHeight;
      if (W < 2 || H < 2) return; // not laid out yet; the resize handler retries
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const off = document.createElement("canvas");
      off.width = W; off.height = H;
      const o = off.getContext("2d")!;
      const lw = Math.min(W * 0.86, H * 0.86 * (215 / 111)), lh = lw * (111 / 215);
      let data: Uint8ClampedArray;
      try {
        o.drawImage(img, (W - lw) / 2, (H - lh) / 2, lw, lh);
        data = o.getImageData(0, 0, W, H).data;
      } catch {
        o.clearRect(0, 0, W, H);
        o.fillStyle = "#fff"; o.font = `700 ${lh}px sans-serif`; o.textAlign = "center"; o.textBaseline = "middle";
        o.fillText("abd", W / 2, H / 2);
        data = o.getImageData(0, 0, W, H).data;
      }
      const gap = Math.max(3, Math.round(W / 150));
      const old = parts;
      parts = [];
      for (let y = 0; y < H; y += gap) for (let x = 0; x < W; x += gap) {
        const k = (y * W + x) * 4;
        if (data[k + 3] < 120) continue;
        const prev = old[parts.length];
        const ang = Math.random() * Math.PI * 2, dist = Math.max(W, H) * (0.6 + Math.random() * 0.6);
        parts.push({
          tx: x, ty: y,
          x: reduced ? x : prev ? prev.x : W / 2 + Math.cos(ang) * dist,
          y: reduced ? y : prev ? prev.y : H / 2 + Math.sin(ang) * dist,
          vx: 0, vy: 0, c: `rgb(${data[k]},${data[k + 1]},${data[k + 2]})`, s: gap * 0.62,
          ph: Math.random() * Math.PI * 2, ease: 0.035 + Math.random() * 0.03,
        });
      }
    };
    img.onload = sample;
    img.onerror = sample;
    img.src = "/img/logo-letters.svg";

    let rt: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(rt); rt = setTimeout(sample, 150); };
    const pos = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    const leave = () => { mouse.x = mouse.y = -9999; };
    const burst = (e: PointerEvent) => {
      pos(e);
      parts.forEach((p) => { const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy) || 1, f = Math.min(40, 2400 / d); p.vx += (dx / d) * f; p.vy += (dy / d) * f; });
    };
    const pulse = () => {
      if (!visible || reduced) return;
      parts.forEach((p) => { const dx = p.x - W / 2, dy = p.y - H / 2, d = Math.hypot(dx, dy) || 1; p.vx += (dx / d) * 2.2; p.vy += (dy / d) * 2.2; });
    };
    addEventListener("resize", onResize);
    addEventListener("abd:pulse", pulse);
    canvas.addEventListener("pointermove", pos);
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("pointerdown", burst);
    const vis = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    vis.observe(host);

    const R = 90;
    // physics in fixed 60 fps steps (so a 30 fps device moves at the same speed),
    // drawing once per frame and switching fillStyle only when the colour changes
    const step = () => {
      t += 0.016;
      for (const p of parts) {
        p.vx += (p.tx + Math.sin(t * 1.4 + p.ph) * 0.8 - p.x) * p.ease;
        p.vy += (p.ty + Math.cos(t * 1.2 + p.ph) * 0.8 - p.y) * p.ease;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < R * R) { const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 6; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
        p.vx *= 0.86; p.vy *= 0.86; p.x += p.vx; p.y += p.vy;
      }
    };
    const loop = canvasLoop(host, (steps) => {
      if (!parts.length) return;
      for (let n = Math.max(1, Math.round(steps)); n > 0; n--) step();
      ctx.clearRect(0, 0, W, H);
      let fill = "";
      for (const p of parts) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const c = dx * dx + dy * dy < R * R || Math.abs(p.vx) + Math.abs(p.vy) > 3 ? "#00c8ff" : p.c;
        if (c !== fill) { ctx.fillStyle = c; fill = c; }
        ctx.fillRect(p.x, p.y, p.s, p.s);
      }
    });

    return () => {
      loop.stop(); vis.disconnect(); clearTimeout(rt);
      removeEventListener("resize", onResize); removeEventListener("abd:pulse", pulse);
      canvas.removeEventListener("pointermove", pos); canvas.removeEventListener("pointerleave", leave); canvas.removeEventListener("pointerdown", burst);
    };
  }, []);

  return <canvas ref={cv} className="logo-particles" role="img" aria-label="ABD Group logotipi zarrachalardan" />;
}
