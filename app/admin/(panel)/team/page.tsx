import { byOrder, readContent } from "@/lib/store";
import { ActButton, ActionForm, ImageField } from "@/components/admin/forms";
import { deleteMember, moveMember, saveMember } from "../../actions";
import type { Member } from "@/lib/types";
import { TrFields } from "@/components/admin/TrFields";

export const metadata = { title: "Jamoa" };

const Fields = ({ m }: { m?: Member }) => (
  <div className="a-client">
    <ImageField name="photo" label="Rasm" current={m?.photo} hint="Kvadrat yoki 4:5, 8 MB gacha" />
    <div className="a-form">
      <div className="a-grid">
        <label className="a-field"><span className="a-label">Ism familiya *</span><input name="name" required defaultValue={m?.name} maxLength={120} /></label>
        <label className="a-field"><span className="a-label">Lavozim</span><input name="role" defaultValue={m?.role} maxLength={120} placeholder="Lead UI/UX dizayner" /></label>
      </div>
      <label className="a-field" style={{ maxWidth: 220 }}>
        <span className="a-label">Rang (rasm bo&apos;lmasa)</span>
        <input type="color" name="color" defaultValue={m?.color ?? "#0e7490"} />
      </label>
      <TrFields compact tr={m?.tr} fields={[{ name: "role", label: "Lavozim", max: 120 }]} />
    </div>
  </div>
);

export default async function TeamAdmin() {
  const team = byOrder((await readContent()).team);
  return (
    <>
      <div className="a-top">
        <div><h1>Jamoa</h1><p>&quot;Biz haqimizda&quot; sahifasidagi jamoa bo&apos;limi va bosh sahifadagi avatarlar. Rasm bo&apos;lmasa, ism bosh harflari rangli fonda ko&apos;rinadi.</p></div>
      </div>

      <div className="a-card">
        <h2>Yangi a&apos;zo qo&apos;shish</h2>
        <ActionForm action={saveMember} submit="Qo'shish" resetOnSuccess><Fields /></ActionForm>
      </div>

      <div className="a-list" style={{ marginTop: 16 }}>
        {team.map((m) => (
          <div className="a-item" key={`${m.id}-${m.photo}`}>
            <ActionForm action={saveMember}><input type="hidden" name="id" value={m.id} /><Fields m={m} /></ActionForm>
            <div className="a-item-side">
              <ActButton action={moveMember} fields={{ id: m.id, dir: -1 }} className="a-btn icon sm" title="Yuqoriga">↑</ActButton>
              <ActButton action={moveMember} fields={{ id: m.id, dir: 1 }} className="a-btn icon sm" title="Pastga">↓</ActButton>
              <ActButton action={deleteMember} fields={{ id: m.id }} className="a-btn icon sm danger" title="O'chirish" confirm={`"${m.name}" ni jamoadan o'chirasizmi?`}>✕</ActButton>
            </div>
          </div>
        ))}
        {!team.length && <p className="a-empty">Hali jamoa a&apos;zosi qo&apos;shilmagan.</p>}
      </div>
    </>
  );
}
