import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readContent, byOrder } from "@/lib/store";
import { isLang, lp, loc } from "@/lib/i18n";
import { dict } from "@/lib/dict";
import { indexable, jsonLd, organizationLd, siteUrl } from "@/lib/seo";
import { FooterWord, Header, Newsletter } from "@/components/site/client";
import SiteEffects from "@/components/site/SiteEffects";

export const dynamic = "force-dynamic";

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = dict(lang).meta;
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t.title, template: "%s — ABD Group" },
    description: t.description,
    applicationName: "ABD Group",
    // previews and local dev must never end up in search results
    robots: indexable() ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } } : { index: false, follow: false },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

const Social = ({ name, d }: { name: string; d: string }) => (
  <a href="#" aria-label={name}><svg viewBox="0 0 24 24" fill="currentColor"><path d={d} /></svg></a>
);

export default async function SiteLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = dict(lang);
  const { projects, settings } = await readContent();
  const footProjects = byOrder(projects.filter((p) => p.published)).slice(0, 4).map((p) => loc(p, lang));
  const to = (path: string) => lp(lang, path);

  return (
    <>
      <div className="page-curtain" aria-hidden="true">
        <span /><span /><span /><span /><span />
        <div className="curtain-logo"><img src="/img/logo.svg" alt="" /></div>
      </div>
      <div className="bg-noise" />
      <div className="cursor-ring hidden" aria-hidden="true"><span>{t.cursorView}</span></div>
      <Header />

      <main>{children}</main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-about">
              <Link href={to("/")} className="logo"><img src="/img/logo.svg" alt="ABD Group" width={78} height={40} /></Link>
              <p>{t.footer.about}</p>
            </div>
            <div><h5>{t.footer.projects}</h5><ul>{footProjects.map((p) => <li key={p.id}><Link href={to(`/proyekt/${p.slug}`)}>{p.name}</Link></li>)}</ul></div>
            <div><h5>{t.footer.services}</h5><ul>{t.footer.serviceLinks.map((s) => <li key={s}><Link href={to("/xizmatlar")}>{s}</Link></li>)}</ul></div>
            <div><h5>{t.footer.help}</h5><ul><li><Link href={to("/aloqa#faq")}>{t.footer.faq}</Link></li><li><Link href={to("/aloqa")}>{t.footer.contact}</Link></li><li><Link href={to("/biz-haqimizda")}>{t.footer.aboutUs}</Link></li><li><a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a></li></ul></div>
            <div className="newsletter"><h5>{t.footer.newsTitle}</h5><p>{t.footer.newsText}</p><Newsletter /></div>
          </div>
          <FooterWord text="abd group" />
          <div className="footer-bottom">
            <span>© 2023–{new Date().getFullYear()} ABD Group. {t.footer.rights}</span>
            <nav><a href="#">{t.footer.terms}</a><a href="#">{t.footer.privacy}</a></nav>
            <div className="socials">
              <Social name="Telegram" d="M21.9 4.3 18.7 19.4c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.2-8.3c.4-.4-.1-.5-.6-.2L6.2 13.1l-4.9-1.5c-1.1-.3-1.1-1 .2-1.5L20.4 2.8c.9-.3 1.7.2 1.5 1.5z" />
              <Social name="Instagram" d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2A3.2 3.2 0 1 1 12 8.8a3.2 3.2 0 0 1 0 6.4zM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM12 2.2c-2.7 0-3 0-4 .1C3.6 2.5 2.5 4.5 2.3 8c-.1 1-.1 1.3-.1 4s0 3 .1 4c.2 3.5 2.2 5.5 5.7 5.7 1 .1 1.3.1 4 .1s3 0 4-.1c3.5-.2 5.5-2.2 5.7-5.7.1-1 .1-1.3.1-4s0-3-.1-4C21.5 4.5 19.5 2.5 16 2.3c-1-.1-1.3-.1-4-.1z" />
              <Social name="YouTube" d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2C.5 9.1.5 12 .5 12s0 2.9.5 4.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8zM9.7 15.5v-7l6 3.5-6 3.5z" />
            </div>
          </div>
        </div>
      </footer>

      <button className="to-top" type="button" aria-label={t.footer.toTop}>
        <svg viewBox="0 0 52 52" style={{ position: "absolute", inset: 0, width: "100%", transform: "rotate(-90deg)" }}><circle cx="26" cy="26" r="24" fill="none" stroke="#00c8ff" strokeWidth="1.5" strokeDasharray="150.8" strokeDashoffset="150.8" /></svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
      </button>
      <div className="toast" role="status" aria-live="polite" />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organizationLd(lang, loc(settings, lang)))} />
      <SiteEffects />
    </>
  );
}
