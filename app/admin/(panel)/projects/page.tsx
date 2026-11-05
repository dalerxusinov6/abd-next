import Link from "next/link";
import { byOrder, readContent } from "@/lib/store";
import { ActButton } from "@/components/admin/forms";
import { deleteProject, moveProject, toggleProject } from "../../actions";
import { CATEGORY_LABELS } from "@/lib/types";

export const metadata = { title: "Loyihalar" };

export default async function ProjectsAdmin() {
  const projects = byOrder((await readContent()).projects);
  const onHome = new Set(projects.filter((p) => p.published).slice(0, 6).map((p) => p.id));
  return (
    <>
      <div className="a-top">
        <div><h1>Loyihalar</h1><p>Tartib saytdagi portfolio tartibiga teng. Birinchi 6 tasi bosh sahifada chiqadi.</p></div>
        <Link href="/admin/projects/new" className="a-btn primary">+ Yangi loyiha</Link>
      </div>
      <div className="a-card" style={{ padding: "14px 10px" }}>
        {projects.length === 0 ? <p className="a-empty">Hali loyiha yo&apos;q.</p> : (
          <table className="a-table">
            <thead><tr><th></th><th>Nomi</th><th className="hide-sm">Toifa</th><th className="hide-sm">Yil</th><th>Holat</th><th></th></tr></thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td><div className="a-thumbcell" style={{ background: p.color }}>{p.cover ? <img src={p.cover} alt="" /> : p.name.slice(0, 2)}</div></td>
                  <td><Link href={`/admin/projects/${p.id}`}><b>{p.name}</b></Link><div className="a-muted" style={{ fontSize: 13 }}>{p.type} · /proyekt/{p.slug}</div></td>
                  <td className="hide-sm a-muted">{CATEGORY_LABELS[p.category]}</td>
                  <td className="hide-sm a-muted">{p.year}</td>
                  <td><ActButton action={toggleProject} fields={{ id: p.id }} className={`a-pill${p.published ? " on" : ""}`} title="Holatni almashtirish">{p.published ? "E'lon qilingan" : "Qoralama"}</ActButton></td>
                  <td>
                    <div className="a-actions">
                      <ActButton action={moveProject} fields={{ id: p.id, dir: -1 }} className="a-btn icon sm" title="Yuqoriga">↑</ActButton>
                      <ActButton action={moveProject} fields={{ id: p.id, dir: 1 }} className="a-btn icon sm" title="Pastga">↓</ActButton>
                      <Link href={`/admin/projects/${p.id}`} className="a-btn sm">Tahrirlash</Link>
                      <ActButton action={deleteProject} fields={{ id: p.id }} className="a-btn sm danger" confirm={`"${p.name}" loyihasini o'chirasizmi? Rasmlari ham o'chadi.`}>O&apos;chirish</ActButton>
                    </div>
                    {onHome.has(p.id) && <small className="a-hint" style={{ display: "block", textAlign: "right", marginTop: 4 }}>Bosh sahifada</small>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
