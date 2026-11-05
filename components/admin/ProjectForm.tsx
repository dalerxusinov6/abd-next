import { ActionForm, GalleryField, ImageField } from "./forms";
import { saveProject } from "@/app/admin/actions";
import { CATEGORIES, CATEGORY_LABELS, type Project } from "@/lib/types";

const F = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <label className="a-field"><span className="a-label">{label}</span>{children}{hint && <small className="a-hint">{hint}</small>}</label>
);

export default function ProjectForm({ p }: { p?: Project }) {
  const results = [0, 1, 2].map((i) => p?.results[i] ?? { value: "", label: "" });
  return (
    <ActionForm action={saveProject} submit={p ? "O'zgarishlarni saqlash" : "Loyihani yaratish"}
      extra={<label className="a-check" style={{ marginRight: "auto" }}><input type="checkbox" name="published" defaultChecked={p ? p.published : true} /> Saytda e&apos;lon qilish</label>}>
      {p && <input type="hidden" name="id" value={p.id} />}

      <div className="a-card">
        <h2>Asosiy ma&apos;lumot</h2>
        <div className="a-form">
          <div className="a-grid">
            <F label="Loyiha nomi *"><input name="name" required defaultValue={p?.name} maxLength={120} /></F>
            <F label="URL (slug)" hint="Bo'sh qoldirsangiz, nomdan avtomatik yasaladi"><input name="slug" defaultValue={p?.slug} maxLength={80} placeholder="masalan: gazna-bank" /></F>
          </div>
          <div className="a-grid four">
            <F label="Turi"><input name="type" defaultValue={p?.type} placeholder="Mobil ilova" maxLength={60} /></F>
            <F label="Toifa (filtr)">
              <select name="category" defaultValue={p?.category ?? "web"}>{CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}</select>
            </F>
            <F label="Yil"><input name="year" type="number" min={2000} max={2100} defaultValue={p?.year ?? new Date().getFullYear()} /></F>
            <F label="Muddat"><input name="duration" defaultValue={p?.duration} placeholder="3 oy" maxLength={40} /></F>
          </div>
          <F label="Sayt havolasi" hint="Loyiha sahifasida «Saytga o'tish» tugmasi chiqadi. Bo'sh qoldirsangiz, tugma ko'rinmaydi."><input name="url" type="url" defaultValue={p?.url} maxLength={300} placeholder="https://example.uz" /></F>
          <div className="a-grid">
            <F label="Mijoz"><input name="client" defaultValue={p?.client} maxLength={120} /></F>
            <F label="Xizmatlar" hint="Vergul bilan ajrating"><input name="services" defaultValue={p?.services.join(", ")} placeholder="UI dizayn, Flutter" /></F>
          </div>
          <F label="Qisqa tavsif" hint="Kartada va loyiha sahifasi boshida chiqadi"><textarea name="description" defaultValue={p?.description} maxLength={600} style={{ minHeight: 70 }} /></F>
        </div>
      </div>

      <div className="a-card">
        <h2>Loyiha sahifasi matni</h2>
        <div className="a-form">
          <F label="Vazifa"><textarea name="task" defaultValue={p?.task} maxLength={3000} /></F>
          <F label="Yechim"><textarea name="solution" defaultValue={p?.solution} maxLength={3000} /></F>
          <span className="a-section-title">Natijalar (raqamlarda)</span>
          <div className="a-grid three">
            {results.map((r, i) => (
              <div key={i} className="a-form" style={{ gap: 8 }}>
                <input name={`r${i}_value`} defaultValue={r.value} placeholder="+65%" maxLength={30} className="a-inline" />
                <input name={`r${i}_label`} defaultValue={r.label} placeholder="Faol foydalanuvchilar" maxLength={80} className="a-inline" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="a-card">
        <h2>Rasmlar va ko&apos;rinish</h2>
        <div className="a-form">
          <div className="a-grid">
            <ImageField name="cover" label="Muqova rasmi" current={p?.cover} hint="Tavsiya: 1600×1000, 8 MB gacha" />
            <div className="a-form">
              <div className="a-grid">
                <F label="Fon rangi"><input type="color" name="color" defaultValue={p?.color ?? "#1d3b8b"} /></F>
                <F label="Aksent rangi"><input type="color" name="accent" defaultValue={p?.accent ?? "#22d3ee"} /></F>
              </div>
              <F label="Muqova bo'lmasa — maket turi">
                <select name="visual" defaultValue={p?.visual ?? "logo"}>
                  <option value="logo">Logo matni</option><option value="laptop">Noutbuk maketi</option><option value="phone">Telefon maketi</option>
                </select>
              </F>
              <F label="Logo matni" hint="Maket turi «Logo matni» bo'lsa ko'rinadi"><input name="logoText" defaultValue={p?.logoText} maxLength={60} /></F>
            </div>
          </div>
          <GalleryField current={p?.gallery ?? []} />
        </div>
      </div>
    </ActionForm>
  );
}
