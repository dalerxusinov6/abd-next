import Link from "next/link";
import ProjectForm from "@/components/admin/ProjectForm";

export const metadata = { title: "Yangi loyiha" };

export default function NewProject() {
  return (
    <>
      <div className="a-top">
        <div><Link href="/admin/projects" className="a-muted">← Loyihalar</Link><h1 style={{ marginTop: 6 }}>Yangi loyiha</h1></div>
      </div>
      <ProjectForm />
    </>
  );
}
