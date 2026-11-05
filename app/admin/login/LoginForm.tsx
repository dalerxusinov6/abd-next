"use client";

import { useActionState } from "react";
import { login } from "../actions";
import type { ActionState } from "@/lib/types";

export default function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, null);
  return (
    <form action={action} className="a-form">
      <div className="a-field">
        <label className="a-label" htmlFor="password">Parol</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" autoFocus />
      </div>
      {state && !state.ok && <p className="a-err" role="alert">{state.message}</p>}
      <button className="a-btn primary" type="submit" disabled={pending} style={{ height: 44 }}>{pending ? "Tekshirilmoqda…" : "Kirish"}</button>
    </form>
  );
}
