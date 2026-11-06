/*
 * Helpers that keep the canvas effects cheap without changing how they look.
 */

/** Weak device: few CPU cores, little memory, or the user asked to save data. */
export function isLowEnd(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 4 || !!nav.connection?.saveData;
}

/**
 * requestAnimationFrame loop that only runs while `el` is on screen and the tab
 * is visible, capped at 30 fps on weak devices. `frame` gets the elapsed time in
 * 60 fps steps (1 = one 60 fps frame), so motion speed is the same at any rate.
 */
export function canvasLoop(el: Element, frame: (steps: number) => void) {
  const minGap = isLowEnd() ? 1000 / 30 - 2 : 0;
  let raf = 0, last = 0, onScreen = false, alive = true;

  const tick = (now: number) => {
    raf = 0;
    if (!alive || !onScreen || document.hidden) return;
    raf = requestAnimationFrame(tick);
    if (now - last < minGap) return;
    const steps = last ? Math.min(4, (now - last) / (1000 / 60)) : 1;
    last = now;
    frame(steps);
  };
  const start = () => { if (!raf && alive && onScreen && !document.hidden) { last = 0; raf = requestAnimationFrame(tick); } };

  const io = new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; start(); });
  io.observe(el);
  const vis = () => start();
  document.addEventListener("visibilitychange", vis);

  return {
    /** draw once more even when nothing moves (e.g. after a resize) */
    kick: start,
    stop() { alive = false; cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener("visibilitychange", vis); },
  };
}
