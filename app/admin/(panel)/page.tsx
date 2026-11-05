import Link from "next/link";
import { readContent } from "@/lib/store";

export default async function Dashboard() {
  const c = await readContent();
  const unread = c.messages.filter((m) => !m.read);
  const cards = [
    { href: "/admin/projects", n: c.projects.length, label: `loyiha · ${c.projects.filter((p) => p.published).length} ta e'lon qilingan` },
    { href: "/admin/clients", n: c.clients.length, label: "mijoz logosi" },
    { href: "/admin/faq", n: c.faq.length, label: "FAQ savol" },
    { href: "/admin/messages", n: unread.length, label: "o'qilmagan xabar" },
  ];
  return (
    <>
      <div className="a-top">
        <div><h1>Xush kelibsiz 👋</h1><p>Sayt kontentini shu yerdan boshqaring. O&apos;zgarishlar darhol saytda ko&apos;rinadi.</p></div>
        <Link href="/admin/projects/new" className="a-btn primary">+ Yangi loyiha</Link>
      </div>
      <div className="a-stats">
        {cards.map((k) => <Link key={k.href} href={k.href} className="a-stat"><b>{k.n}</b><span>{k.label}</span></Link>)}
      </div>
      <div className="a-card">
        <h2>So&apos;nggi xabarlar</h2>
        {c.messages.length === 0 ? <p className="a-empty">Hozircha xabar yo&apos;q. Aloqa sahifasidagi forma orqali kelgan so&apos;rovlar shu yerda chiqadi.</p> : (
          <table className="a-table">
            <thead><tr><th>Ism</th><th>Telefon</th><th className="hide-sm">Xizmat</th><th className="hide-sm">Sana</th></tr></thead>
            <tbody>
              {c.messages.slice(0, 5).map((m) => (
                <tr key={m.id}>
                  <td>{!m.read && <span className="a-badge" style={{ display: "inline-grid", marginRight: 8 }}>•</span>}{m.name}</td>
                  <td><a href={`tel:${m.phone.replace(/\s/g, "")}`}>{m.phone}</a></td>
                  <td className="hide-sm a-muted">{m.services.join(", ") || "—"}</td>
                  <td className="hide-sm a-muted">{new Date(m.createdAt).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ marginTop: 14 }}><Link href="/admin/messages" className="a-btn sm">Barcha xabarlar →</Link></div>
      </div>
    </>
  );
}
