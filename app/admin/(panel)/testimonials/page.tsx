import { byOrder, readContent } from "@/lib/store";
import { ActButton, ActionForm } from "@/components/admin/forms";
import { deleteTestimonial, moveTestimonial, saveTestimonial } from "../../actions";
import type { Testimonial } from "@/lib/types";
import { TrFields } from "@/components/admin/TrFields";

export const metadata = { title: "Fikrlar" };

const Fields = ({ t }: { t?: Testimonial }) => (
  <>
    <div className="a-grid three">
      <label className="a-field"><span className="a-label">Ism *</span><input name="name" required defaultValue={t?.name} maxLength={120} /></label>
      <label className="a-field"><span className="a-label">Lavozim · Kompaniya</span><input name="role" defaultValue={t?.role} maxLength={160} /></label>
      <label className="a-field"><span className="a-label">Avatar rangi</span><input type="color" name="color" defaultValue={t?.color ?? "#00c8ff"} /></label>
    </div>
    <label className="a-field"><span className="a-label">Fikr matni *</span><textarea name="text" required defaultValue={t?.text} maxLength={1200} /></label>
    <TrFields compact tr={t?.tr} fields={[{ name: "role", label: "Lavozim · Kompaniya", max: 160 }, { name: "text", label: "Fikr matni", kind: "area", max: 1200 }]} />
  </>
);

export default async function TestimonialsAdmin() {
  const list = byOrder((await readContent()).testimonials);
  return (
    <>
      <div className="a-top"><div><h1>Mijozlar fikrlari</h1><p>Bosh sahifadagi slayder.</p></div></div>
      <div className="a-card">
        <h2>Yangi fikr</h2>
        <ActionForm action={saveTestimonial} submit="Qo'shish" resetOnSuccess><Fields /></ActionForm>
      </div>
      <div className="a-list" style={{ marginTop: 16 }}>
        {list.map((t) => (
          <div className="a-item" key={t.id}>
            <ActionForm action={saveTestimonial}><input type="hidden" name="id" value={t.id} /><Fields t={t} /></ActionForm>
            <div className="a-item-side">
              <ActButton action={moveTestimonial} fields={{ id: t.id, dir: -1 }} className="a-btn icon sm" title="Yuqoriga">↑</ActButton>
              <ActButton action={moveTestimonial} fields={{ id: t.id, dir: 1 }} className="a-btn icon sm" title="Pastga">↓</ActButton>
              <ActButton action={deleteTestimonial} fields={{ id: t.id }} className="a-btn icon sm danger" title="O'chirish" confirm="Bu fikrni o'chirasizmi?">✕</ActButton>
            </div>
          </div>
        ))}
        {!list.length && <p className="a-empty">Hali fikr yo&apos;q.</p>}
      </div>
    </>
  );
}
