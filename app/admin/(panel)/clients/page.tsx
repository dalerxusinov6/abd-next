import { byOrder, readContent } from "@/lib/store";
import { ActButton, ActionForm, ImageField } from "@/components/admin/forms";
import { deleteClient, moveClient, saveClient } from "../../actions";

export const metadata = { title: "Mijozlar" };

export default async function ClientsAdmin() {
  const clients = byOrder((await readContent()).clients);
  return (
    <>
      <div className="a-top"><div><h1>Mijozlar logolari</h1><p>&quot;Hamkorlar&quot; bo&apos;limida va bosh sahifada chiqadi. Logo bo&apos;lmasa, nomi matn sifatida ko&apos;rinadi. Oq yoki shaffof fonli PNG/SVG tavsiya etiladi.</p></div></div>

      <div className="a-card">
        <h2>Yangi mijoz qo&apos;shish</h2>
        <ActionForm action={saveClient} submit="Qo'shish" resetOnSuccess>
          <div className="a-client">
            <ImageField name="logo" label="Logo" contain />
            <div className="a-form">
              <label className="a-field"><span className="a-label">Nomi *</span><input name="name" required maxLength={80} /></label>
              <label className="a-field"><span className="a-label">Sayt manzili (ixtiyoriy)</span><input name="url" type="url" placeholder="https://" maxLength={300} /></label>
            </div>
          </div>
        </ActionForm>
      </div>

      <div className="a-list" style={{ marginTop: 16 }}>
        {clients.map((c) => (
          <div className="a-item" key={`${c.id}-${c.logo}`}>
            <ActionForm action={saveClient}>
              <input type="hidden" name="id" value={c.id} />
              <div className="a-client">
                <ImageField name="logo" label="Logo" current={c.logo} contain />
                <div className="a-form">
                  <label className="a-field"><span className="a-label">Nomi</span><input name="name" required defaultValue={c.name} maxLength={80} /></label>
                  <label className="a-field"><span className="a-label">Sayt manzili</span><input name="url" type="url" defaultValue={c.url} placeholder="https://" maxLength={300} /></label>
                </div>
              </div>
            </ActionForm>
            <div className="a-item-side">
              <ActButton action={moveClient} fields={{ id: c.id, dir: -1 }} className="a-btn icon sm" title="Yuqoriga">↑</ActButton>
              <ActButton action={moveClient} fields={{ id: c.id, dir: 1 }} className="a-btn icon sm" title="Pastga">↓</ActButton>
              <ActButton action={deleteClient} fields={{ id: c.id }} className="a-btn icon sm danger" title="O'chirish" confirm={`"${c.name}" ni o'chirasizmi?`}>✕</ActButton>
            </div>
          </div>
        ))}
        {!clients.length && <p className="a-empty">Hali mijoz qo&apos;shilmagan.</p>}
      </div>
    </>
  );
}
