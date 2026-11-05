import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { readContent } from "@/lib/store";
import AdminNav from "@/components/admin/Nav";
import { logout } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const { messages } = await readContent();
  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="admin">
      <aside className="a-side">
        <Link href="/admin" className="a-logo"><img src="/img/logo.svg" alt="ABD Group" /> Admin</Link>
        <AdminNav unread={unread} />
        <div className="a-side-foot">
          <a href="/" target="_blank" rel="noopener" className="a-btn">Saytni ko&apos;rish ↗</a>
          <form action={logout}><button className="a-btn" type="submit" style={{ width: "100%" }}>Chiqish</button></form>
        </div>
      </aside>
      <main className="a-main">{children}</main>
    </div>
  );
}
