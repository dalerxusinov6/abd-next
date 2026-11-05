import { byOrder, readContent } from "@/lib/store";
import { ActButton, ActionForm } from "@/components/admin/forms";
import { deleteFaq, moveFaq, saveFaq } from "../../actions";

export const metadata = { title: "FAQ" };

export default async function FaqAdmin() {
  const faq = byOrder((await readContent()).faq);
  return (
    <>
      <div className="a-top"><div><h1>Ko&apos;p beriladigan savollar</h1><p>Bosh sahifa va Aloqa sahifasidagi FAQ bo&apos;limi.</p></div></div>

      <div className="a-card">
        <h2>Yangi savol</h2>
        <ActionForm action={saveFaq} submit="Qo'shish" resetOnSuccess>
          <label className="a-field"><span className="a-label">Savol *</span><input name="question" required maxLength={300} /></label>
          <label className="a-field"><span className="a-label">Javob *</span><textarea name="answer" required maxLength={3000} /></label>
        </ActionForm>
      </div>

      <div className="a-list" style={{ marginTop: 16 }}>
        {faq.map((f, i) => (
          <div className="a-item" key={f.id}>
            <ActionForm action={saveFaq}>
              <input type="hidden" name="id" value={f.id} />
              <label className="a-field"><span className="a-label">Savol {i + 1}</span><input name="question" required defaultValue={f.question} maxLength={300} /></label>
              <label className="a-field"><span className="a-label">Javob</span><textarea name="answer" required defaultValue={f.answer} maxLength={3000} /></label>
            </ActionForm>
            <div className="a-item-side">
              <ActButton action={moveFaq} fields={{ id: f.id, dir: -1 }} className="a-btn icon sm" title="Yuqoriga">↑</ActButton>
              <ActButton action={moveFaq} fields={{ id: f.id, dir: 1 }} className="a-btn icon sm" title="Pastga">↓</ActButton>
              <ActButton action={deleteFaq} fields={{ id: f.id }} className="a-btn icon sm danger" title="O'chirish" confirm="Bu savolni o'chirasizmi?">✕</ActButton>
            </div>
          </div>
        ))}
        {!faq.length && <p className="a-empty">Hali savol yo&apos;q.</p>}
      </div>
    </>
  );
}
