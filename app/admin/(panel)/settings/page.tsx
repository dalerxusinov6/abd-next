import { readContent } from "@/lib/store";
import { ActionForm } from "@/components/admin/forms";
import { saveSettings } from "../../actions";

export const metadata = { title: "Sozlamalar" };

export default async function SettingsAdmin() {
  const s = (await readContent()).settings;
  const F = ({ name, label, value, type = "text" }: { name: string; label: string; value: string | number; type?: string }) => (
    <label className="a-field"><span className="a-label">{label}</span><input name={name} type={type} defaultValue={value} min={type === "number" ? 0 : undefined} /></label>
  );
  return (
    <>
      <div className="a-top"><div><h1>Sozlamalar</h1><p>Bosh sahifa sarlavhasi, raqamlar va aloqa ma&apos;lumotlari.</p></div></div>
      <ActionForm action={saveSettings}>
        <div className="a-card">
          <h2>Bosh sahifa</h2>
          <label className="a-field">
            <span className="a-label">&quot;Biznesingiz uchun ___ ishlab chiqamiz&quot; — almashinadigan so&apos;zlar</span>
            <textarea name="heroWords" defaultValue={s.heroWords.join("\n")} style={{ minHeight: 130 }} />
            <small className="a-hint">Har bir qatorga bitta so&apos;z yoki ibora</small>
          </label>
        </div>
        <div className="a-card">
          <h2>Raqamlar</h2>
          <div className="a-grid four">
            <F name="projects" label="Loyihalar soni" value={s.stats.projects} type="number" />
            <F name="clients" label="Doimiy mijozlar" value={s.stats.clients} type="number" />
            <F name="years" label="Tajriba (yil)" value={s.stats.years} type="number" />
            <F name="team" label="Jamoa a'zolari" value={s.stats.team} type="number" />
          </div>
        </div>
        <div className="a-card">
          <h2>Aloqa</h2>
          <div className="a-grid">
            <F name="phone" label="Telefon" value={s.phone} />
            <F name="email" label="Email" value={s.email} type="email" />
            <F name="telegram" label="Telegram (username)" value={s.telegram} />
            <F name="address" label="Manzil" value={s.address} />
          </div>
        </div>
      </ActionForm>
    </>
  );
}
