import { EXTRA_LANGS, type ExtraLang } from "@/lib/i18n";

/*
 * Russian / English versions of a form's text fields, folded under the Uzbek
 * original. Inputs are named "tr.ru.<field>" / "tr.en.<field>"; readTr() in
 * app/admin/actions.ts reads them back. Empty fields fall back to Uzbek on the site.
 */
export type TrField = {
  name: string;
  label: string;
  /** "lines": one value per line; "list": comma-separated; "area": multi-line text */
  kind?: "input" | "area" | "lines" | "list";
  max?: number;
  placeholder?: string;
};

const LANG_NAMES: Record<ExtraLang, string> = { ru: "Русский", en: "English" };

const show = (v: unknown, kind: TrField["kind"]) =>
  Array.isArray(v) ? v.join(kind === "lines" ? "\n" : ", ") : typeof v === "string" ? v : "";

export function TrFields({ fields, tr, compact }: {
  fields: TrField[];
  tr?: Partial<Record<ExtraLang, Record<string, unknown>>>;
  compact?: boolean;
}) {
  return (
    <div className={`a-tr${compact ? " compact" : ""}`}>
      {EXTRA_LANGS.map((l) => {
        const filled = fields.filter((f) => show(tr?.[l]?.[f.name], f.kind).trim()).length;
        return (
          <details key={l} className="a-tr-lang">
            <summary>
              <b>{l.toUpperCase()}</b> {LANG_NAMES[l]}
              <span className={`a-tr-count${filled === fields.length ? " full" : filled ? "" : " empty"}`}>{filled}/{fields.length}</span>
            </summary>
            <div className="a-form">
              {fields.map((f) => {
                const name = `tr.${l}.${f.name}`;
                const value = show(tr?.[l]?.[f.name], f.kind);
                return (
                  <label className="a-field" key={f.name}>
                    <span className="a-label">{f.label}</span>
                    {f.kind === "area" || f.kind === "lines"
                      ? <textarea name={name} defaultValue={value} maxLength={f.max} placeholder={f.placeholder} style={f.kind === "lines" ? { minHeight: 110 } : undefined} />
                      : <input name={name} defaultValue={value} maxLength={f.max} placeholder={f.placeholder} />}
                  </label>
                );
              })}
            </div>
          </details>
        );
      })}
      <small className="a-hint">Bo&apos;sh qoldirilgan maydon saytda o&apos;zbekcha ko&apos;rinadi.</small>
    </div>
  );
}
