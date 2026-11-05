import { readContent } from "@/lib/store";
import { ActButton } from "@/components/admin/forms";
import { deleteMessage, deleteSubscriber, toggleMessage } from "../../actions";

export const metadata = { title: "Xabarlar" };
const when = (iso: string) => new Date(iso).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent", dateStyle: "medium", timeStyle: "short" });

export default async function MessagesAdmin() {
  const { messages, subscribers } = await readContent();
  return (
    <>
      <div className="a-top"><div><h1>Xabarlar</h1><p>Aloqa sahifasidagi forma orqali kelgan so&apos;rovlar va yangiliklarga obunachilar.</p></div></div>

      <div className="a-list">
        {messages.map((m) => (
          <article key={m.id} className={`a-msg${m.read ? "" : " unread"}`}>
            <div className="a-msg-head">
              <div><b>{m.name}</b> <span className="a-muted" style={{ fontSize: 13 }}>· {when(m.createdAt)}</span></div>
              <div className="a-actions">
                <ActButton action={toggleMessage} fields={{ id: m.id }} className="a-btn sm">{m.read ? "O'qilmagan deb belgilash" : "O'qildi"}</ActButton>
                <ActButton action={deleteMessage} fields={{ id: m.id }} className="a-btn sm danger" confirm="Xabarni o'chirasizmi?">O&apos;chirish</ActButton>
              </div>
            </div>
            <div className="a-tags">
              <a className="a-pill" href={`tel:${m.phone.replace(/\s/g, "")}`}>📞 {m.phone}</a>
              {m.email && <a className="a-pill" href={`mailto:${m.email}`}>✉ {m.email}</a>}
              {m.budget && <span className="a-pill">💰 {m.budget}</span>}
              {m.services.map((s) => <span key={s} className="a-pill on">{s}</span>)}
            </div>
            {m.text && <p>{m.text}</p>}
          </article>
        ))}
        {!messages.length && <div className="a-card"><p className="a-empty">Hozircha xabar yo&apos;q.</p></div>}
      </div>

      <div className="a-card" style={{ marginTop: 24 }}>
        <h2>Obunachilar ({subscribers.length})</h2>
        {subscribers.length === 0 ? <p className="a-muted">Hali obunachi yo&apos;q.</p> : (
          <table className="a-table">
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.email}>
                  <td><a href={`mailto:${s.email}`}>{s.email}</a></td>
                  <td className="a-muted hide-sm">{when(s.createdAt)}</td>
                  <td><div className="a-actions"><ActButton action={deleteSubscriber} fields={{ email: s.email }} className="a-btn icon sm danger" title="O'chirish" confirm="Obunachini o'chirasizmi?">✕</ActButton></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
