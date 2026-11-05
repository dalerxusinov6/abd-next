"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/types";

type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;

/*
 * Form bound to a server action that keeps what the user typed when the
 * action returns an error (React would otherwise reset the form).
 */
export function ActionForm({ action, children, submit = "Saqlash", className = "a-form", resetOnSuccess = false, extra }: {
  action: Action; children: ReactNode; submit?: string; className?: string; resetOnSuccess?: boolean; extra?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  const [shown, setShown] = useState<ActionState>(null);

  useEffect(() => {
    setShown(state);
    if (state?.ok && resetOnSuccess) ref.current?.reset();
    if (!state?.ok) return;
    const t = setTimeout(() => setShown(null), 3000);
    return () => clearTimeout(t);
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={ref}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
    >
      {children}
      <div className="a-form-foot">
        {extra}
        {shown && <span className={shown.ok ? "a-ok" : "a-err"} role="status">{shown.message}</span>}
        <button className="a-btn primary" type="submit" disabled={pending}>{pending ? "Saqlanmoqda…" : submit}</button>
      </div>
    </form>
  );
}

/* Small one-click form (delete / move / toggle). */
export function ActButton({ action, fields, children, confirm: ask, className = "a-btn", title }: {
  action: (fd: FormData) => Promise<void>; fields: Record<string, string | number>; children: ReactNode; confirm?: string; className?: string; title?: string;
}) {
  return (
    <form action={action} onSubmit={(e) => { if (ask && !window.confirm(ask)) e.preventDefault(); }} style={{ display: "inline" }}>
      {Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <Pending className={className} title={title}>{children}</Pending>
    </form>
  );
}

function Pending({ children, className, title }: { children: ReactNode; className: string; title?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className={className} disabled={pending} title={title}>{children}</button>;
}

/* Image picker with preview + "remove current" option. */
export function ImageField({ name, label, current, hint, contain }: { name: string; label: string; current?: string | null; hint?: string; contain?: boolean }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const src = preview || (remove ? null : current);
  return (
    <div className="a-field">
      <span className="a-label">{label}</span>
      <label className={`a-drop${contain ? " contain" : ""}`}>
        {src ? <img src={src} alt="" /> : <span>Rasm tanlang yoki shu yerga tashlang</span>}
        <input type="file" name={name} accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
          onChange={(e) => { const f = e.target.files?.[0]; setPreview(f ? URL.createObjectURL(f) : null); }} />
      </label>
      <div className="a-row-sm">
        {hint && <small className="a-hint">{hint}</small>}
        {current && !preview && (
          <label className="a-check"><input type="checkbox" name={`${name}_remove`} checked={remove} onChange={(e) => setRemove(e.target.checked)} /> Rasmni o&apos;chirish</label>
        )}
      </div>
    </div>
  );
}

/* Multiple new gallery images with live thumbnails. */
export function GalleryField({ current }: { current: string[] }) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  return (
    <div className="a-field">
      <span className="a-label">Galereya</span>
      <div className="a-gallery">
        {current.map((g) => (
          <label key={g} className={`a-thumb${removed.has(g) ? " removed" : ""}`}>
            <img src={g} alt="" />
            <span><input type="checkbox" name="gallery_remove" value={g} onChange={(e) => { const n = new Set(removed); if (e.target.checked) n.add(g); else n.delete(g); setRemoved(n); }} /> o&apos;chirish</span>
          </label>
        ))}
        {previews.map((p) => <div key={p} className="a-thumb new"><img src={p} alt="" /><span>yangi</span></div>)}
        <label className="a-thumb add">
          <span>+ Rasm qo&apos;shish</span>
          <input type="file" name="gallery_new" multiple accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
            onChange={(e) => setPreviews([...(e.target.files || [])].map((f) => URL.createObjectURL(f)))} />
        </label>
      </div>
      <small className="a-hint">Bo&apos;sh qoldirilsa, loyiha sahifasida avtomatik maket ko&apos;rsatiladi.</small>
    </div>
  );
}
