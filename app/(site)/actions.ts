"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { newId, updateContent } from "@/lib/store";
import { rateLimited } from "@/lib/auth";
import type { ActionState } from "@/lib/types";
import { isLang } from "@/lib/i18n";
import { dict } from "@/lib/dict";

const str = (fd: FormData, k: string, max: number) => String(fd.get(k) ?? "").trim().slice(0, max);
/** Messages in the language of the page the form was sent from. */
const msgs = (fd: FormData) => { const l = String(fd.get("lang") ?? ""); return dict(isLang(l) ? l : "uz").msg; };
const clientKey = async (kind: string) => `${kind}:${(await headers()).get("x-forwarded-for")?.split(",")[0] ?? "local"}`;

export async function submitContact(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const m = msgs(fd);
  if (str(fd, "website", 200)) return { ok: true, message: m.received }; // bot filled the honeypot
  if (rateLimited(await clientKey("contact"), 5, 10 * 60_000)) return { ok: false, message: m.tooMany };

  const name = str(fd, "name", 120);
  const phone = str(fd, "phone", 40);
  const email = str(fd, "email", 160);
  if (!name || !phone) return { ok: false, message: m.needNamePhone };
  if (!/^[+\d][\d\s()-]{6,}$/.test(phone)) return { ok: false, message: m.badPhone };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: m.badEmail };

  await updateContent((c) => {
    c.messages.unshift({
      id: newId("m"),
      name, phone, email,
      services: fd.getAll("services").map(String).slice(0, 10),
      budget: str(fd, "budget", 40),
      text: str(fd, "text", 4000),
      createdAt: new Date().toISOString(),
      read: false,
    });
  });
  revalidatePath("/admin", "layout");
  return { ok: true, message: m.received };
}

export async function subscribe(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const m = msgs(fd);
  const email = str(fd, "email", 160).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: m.badEmail };
  if (rateLimited(await clientKey("sub"), 5, 10 * 60_000)) return { ok: false, message: m.tooMany };
  await updateContent((c) => {
    if (!c.subscribers.some((s) => s.email === email)) c.subscribers.unshift({ email, createdAt: new Date().toISOString() });
  });
  return { ok: true, message: m.subscribed };
}
