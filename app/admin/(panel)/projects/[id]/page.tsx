import Link from "next/link";
import { notFound } from "next/navigation";
import { readContent } from "@/lib/store";
import ProjectForm from "@/components/admin/ProjectForm";
import { ActButton } from "@/components/admin/forms";
import { deleteProject } from "../../../actions";

export const metadata = { title: "Loyihani tahrirlash" };

export default async function EditProject({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const { created } = await searchParams;
  const p = (await readContent()).projects.find((x) => x.id === id);
  if (!p) notFound();
  return (
    <>
      <div className="a-top">
        <div>
          <Link href="/admin/projects" className="a-muted">← Loyihalar</Link>
          <h1 style={{ marginTop: 6 }}>{p.name}</h1>
          {created && <p className="a-ok">Loyiha yaratildi. Endi rasmlar va matnlarni to&apos;ldirishingiz mumkin.</p>}
        </div>
        <div className="a-actions">
          {p.published && <a href={`/proyekt/${p.slug}`} target="_blank" rel="noopener" className="a-btn">Saytda ko&apos;rish ↗</a>}
          <ActButton action={deleteProject} fields={{ id: p.id, back: 1 }} className="a-btn danger" confirm={`"${p.name}" loyihasini o'chirasizmi?`}>O&apos;chirish</ActButton>
        </div>
      </div>
      <ProjectForm key={`${p.id}-${p.cover}-${p.gallery.length}`} p={p} />
    </>
  );
}
