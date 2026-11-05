import Link from "next/link";
import type { ReactNode } from "react";
import type { Project } from "@/lib/types";

export const Arrow = ({ className = "arrow" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

/** Text that rolls up on hover (two stacked copies). */
export const Roll = ({ children }: { children: string }) => (
  <span className="roll"><span data-t={children}>{children}</span></span>
);

type BtnProps = { href: string; children: string; variant?: "primary" | "ghost"; arrow?: boolean; small?: boolean; reveal?: boolean; delay?: number };
export const Btn = ({ href, children, variant = "primary", arrow = variant === "primary", small, reveal, delay }: BtnProps) => (
  <Link
    href={href}
    className={`btn btn-${variant}${small ? " btn-sm" : ""}`}
    {...(reveal ? { "data-reveal": "" } : {})}
    {...(delay ? { "data-delay": String(delay) } : {})}
  >
    <Roll>{children}</Roll>
    {arrow && <Arrow />}
  </Link>
);

/*
 * Headline that reveals word by word.
 * "|" = line break, *text* = cyan highlight with a drawn underline.
 */
export function Split({ text, as: Tag = "h2", className = "h-1", style }: { text: string; as?: "h1" | "h2" | "div"; className?: string; style?: React.CSSProperties }) {
  let i = 0;
  const words = (chunk: string) =>
    chunk.split(/\s+/).filter(Boolean).flatMap((w, k, arr) => {
      const node = (
        <span className="w" key={`${i}-${w}`}>
          <span style={{ ["--d" as string]: i++ }}>{w}</span>
        </span>
      );
      return k < arr.length - 1 ? [node, " "] : [node];
    });
  const lines = text.split("|");
  return (
    <Tag className={className} data-split="" style={style}>
      {lines.map((line, li) => (
        <span key={li}>
          {line.split(/(\*[^*]+\*)/).filter(Boolean).map((part, pi) =>
            part.startsWith("*") ? (
              <span className="grad" key={pi}>{words(part.slice(1, -1))}</span>
            ) : (
              <span key={pi}>{words(part)}{part.endsWith(" ") ? " " : ""}</span>
            )
          )}
          {li < lines.length - 1 && <br />}
        </span>
      ))}
    </Tag>
  );
}

export const initials = (name: string) => name.split(/\s+/).filter(Boolean).map((s) => s[0]).slice(0, 2).join("").toUpperCase();

export const Eyebrow = ({ children }: { children: ReactNode }) => <span className="eyebrow" data-reveal="">{children}</span>;

/* ---------- project artwork (uploaded cover or generated mock) ---------- */
export function WorkVisual({ p }: { p: Project }) {
  if (p.visual === "phone")
    return (
      <>
        <div className="mock mock-phone" style={{ left: "18%", top: "16%", transform: "rotate(-8deg)", ["--r" as string]: "-6deg" }} />
        <div className="mock mock-phone" style={{ left: "48%", top: "22%", transform: "rotate(6deg)", ["--r" as string]: "6deg" }} />
      </>
    );
  if (p.visual === "laptop")
    return (
      <div className="mock mock-laptop" style={{ left: "13%", top: "12%", ["--art" as string]: p.accent }}>
        <i />
      </div>
    );
  return <div className="work-logo">{p.logoText || p.name}</div>;
}

export function WorkArt({ p, image, dim }: { p: Project; image?: string | null; dim?: boolean }) {
  const src = image === undefined ? p.cover : image;
  return (
    <div className="work-art" style={{ background: p.color, filter: dim ? "brightness(.82)" : undefined }}>
      {src ? <img className="cover-img" src={src} alt="" loading="lazy" /> : <WorkVisual p={p} />}
    </div>
  );
}

export function WorkCard({ p, size, delay }: { p: Project; size: string; delay?: number }) {
  return (
    <Link
      href={`/proyekt/${p.slug}`}
      className={`work ${size}`}
      data-cat={p.category}
      data-cursor="view"
      data-reveal="scale"
      style={{ transitionDelay: delay ? `${delay}s` : undefined }}
      aria-label={`${p.name} — ${p.type}`}
    >
      <WorkArt p={p} />
      <div className="work-tags"><span className="tag">{p.type}</span><span className="tag">{p.year}</span></div>
      <div className="work-meta">
        <div><h3>{p.name}</h3><span>{p.client}</span></div>
        <span className="work-go"><Arrow className="" /></span>
      </div>
    </Link>
  );
}

export const CtaBox = ({ eyebrow, title, button, href = "/aloqa" }: { eyebrow: string; title: string; button: string; href?: string }) => (
  <section className="section" style={{ paddingTop: 0 }}>
    <div className="container">
      <div className="cta-box" data-reveal="scale">
        <div className="rings" aria-hidden="true"><i /><i /><i /></div>
        <span className="eyebrow">{eyebrow}</span>
        <Split text={title} className="h-1 text-balance" />
        <Btn href={href}>{button}</Btn>
      </div>
    </div>
  </section>
);

export const PageHero = ({ crumb, title, lead }: { crumb: string; title: string; lead: string }) => (
  <section className="page-hero">
    <canvas className="dot-field" aria-hidden="true" />
    <div className="container">
      <div className="crumbs" data-reveal=""><Link href="/">Bosh sahifa</Link> / <span>{crumb}</span></div>
      <Split as="h1" className="h-display" text={title} />
      <p className="lead" data-reveal="" data-delay=".3">{lead}</p>
    </div>
  </section>
);
