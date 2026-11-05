import { redirect } from "next/navigation";
import { isAdmin, isConfigured } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata = { title: "Kirish" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="a-login">
      <div className="a-card">
        <img src="/img/logo.svg" alt="ABD Group" />
        <div>
          <h1>Admin panelga kirish</h1>
          <p className="a-muted" style={{ fontSize: 14, marginTop: 4 }}>Loyihalar, mijozlar va FAQ ni boshqarish</p>
        </div>
        {!isConfigured() && <p className="a-err">Server sozlanmagan: <code>.env.local</code> faylida ADMIN_PASSWORD va ADMIN_SECRET (kamida 16 belgi) ni kiriting.</p>}
        <LoginForm />
      </div>
    </div>
  );
}
