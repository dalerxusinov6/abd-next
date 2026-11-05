"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { newId, updateContent } from "@/lib/store";
import { rateLimited } from "@/lib/auth";
import type { ActionState } from "@/lib/types";

const str = (fd: FormData, k: string, max: number) => String(fd.get(k) ?? "").trim().slice(0, max);
const clientKey = async (kind: string) => `${kind}:${(await headers()).get("x-forwarded-for")?.split(",")[0] ?? "local"}`;

export async function submitContact(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (str(fd, "website", 200)) return { ok: true, message: "So'rovingiz qabul qilindi." }; // bot filled the honeypot
  if (rateLimited(await clientKey("contact"), 5, 10 * 60_000)) return { ok: false, message: "Juda ko'p urinish. Birozdan keyin qayta yuboring." };

  const name = str(fd, "name", 120);
  const phone = str(fd, "phone", 40);
  const email = str(fd, "email", 160);
  if (!name || !phone) return { ok: false, message: "Ism va telefon raqamni kiriting." };
  if (!/^[+\d][\d\s()-]{6,}$/.test(phone)) return { ok: false, message: "Telefon raqam noto'g'ri ko'rinadi." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "Email manzil noto'g'ri." };

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
  return { ok: true, message: "So'rovingiz qabul qilindi. Menejerimiz tez orada bog'lanadi." };
}

export async function subscribe(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email", 160).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "Email manzil noto'g'ri." };
  if (rateLimited(await clientKey("sub"), 5, 10 * 60_000)) return { ok: false, message: "Juda ko'p urinish." };
  await updateContent((c) => {
    if (!c.subscribers.some((s) => s.email === email)) c.subscribers.unshift({ email, createdAt: new Date().toISOString() });
  });
  return { ok: true, message: "Rahmat! 30% chegirma emailingizga yuboriladi ✨" };
}
