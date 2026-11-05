"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, createSession, destroySession, isConfigured, rateLimited, requireAdmin } from "@/lib/auth";
import { newId, slugify, updateContent } from "@/lib/store";
import { deleteUpload, saveUpload, UploadError } from "@/lib/uploads";
import { CATEGORIES, VISUALS, type ActionState, type Category, type Content, type Visual } from "@/lib/types";

/* ---------- helpers ---------- */
const s = (fd: FormData, k: string, max = 500) => String(fd.get(k) ?? "").trim().slice(0, max);
const int = (fd: FormData, k: string, fallback = 0) => { const n = parseInt(s(fd, k, 12), 10); return Number.isFinite(n) ? n : fallback; };
const color = (fd: FormData, k: string, fallback: string) => { const v = s(fd, k, 9); return /^#[0-9a-f]{6}$/i.test(v) ? v : fallback; };
const safeUrl = (v: string) => (/^https?:\/\/[^\s]+$/i.test(v) ? v : "");
const refresh = () => revalidatePath("/", "layout");
const fail = (message: string): ActionState => ({ ok: false, message });
const done = (message = "Saqlandi"): ActionState => ({ ok: true, message });

type Ordered = { id: string; order: number };
function move<T extends Ordered>(list: T[], id: string, dir: number) {
  list.sort((a, b) => a.order - b.order).forEach((x, i) => (x.order = i));
  const i = list.findIndex((x) => x.id === id), j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i].order, list[j].order] = [list[j].order, list[i].order];
}
const nextOrder = (list: Ordered[]) => list.reduce((m, x) => Math.max(m, x.order + 1), 0);

/** Saves content; on failure removes files uploaded in this request and returns a message instead of crashing. */
async function save(mutate: Parameters<typeof updateContent>[0], newFiles: (string | null)[] = []): Promise<ActionState> {
  try {
    await updateContent(mutate);
    return null;
  } catch (e) {
    console.error("[admin] save failed", e);
    await Promise.all(newFiles.map(deleteUpload));
    return fail("Saqlab bo'lmadi. Sahifani yangilab, qayta urinib ko'ring.");
  }
}

/* ---------- auth ---------- */
export async function login(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!isConfigured()) return fail("Server sozlanmagan: .env.local faylida ADMIN_PASSWORD va ADMIN_SECRET ni kiriting.");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (rateLimited(`login:${ip}`)) return fail("Juda ko'p urinish. 1 daqiqadan keyin qayta urining.");
  if (!checkPassword(String(fd.get("password") ?? ""))) return fail("Parol noto'g'ri.");
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* ---------- projects ---------- */
export async function saveProject(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = s(fd, "id", 40);
  const name = s(fd, "name", 120);
  if (!name) return fail("Loyiha nomini kiriting.");
  const category = s(fd, "category", 20) as Category;
  const visual = s(fd, "visual", 20) as Visual;

  const uploaded: string[] = [];
  let cover: string | null = null;
  let gallery: string[] = [];
  try {
    cover = await saveUpload(fd.get("cover"));
    if (cover) uploaded.push(cover);
    for (const f of fd.getAll("gallery_new")) {
      const url = await saveUpload(f);
      if (url) { uploaded.push(url); gallery.push(url); }
    }
  } catch (e) {
    await Promise.all(uploaded.map(deleteUpload));
    if (e instanceof UploadError) return fail(e.message);
    throw e;
  }

  const results = [0, 1, 2]
    .map((i) => ({ value: s(fd, `r${i}_value`, 30), label: s(fd, `r${i}_label`, 80) }))
    .filter((r) => r.value || r.label);
  const removeGallery = new Set(fd.getAll("gallery_remove").map(String));
  const toDelete: (string | null)[] = [];
  let savedId = id;

  const err = await save((c) => {
    const existing = id ? c.projects.find((p) => p.id === id) : undefined;
    let slug = slugify(s(fd, "slug", 80) || name);
    const taken = (x: string) => c.projects.some((p) => p.slug === x && p.id !== existing?.id);
    for (let n = 2; taken(slug); n++) slug = `${slugify(s(fd, "slug", 80) || name)}-${n}`;

    const base = {
      slug, name,
      type: s(fd, "type", 60) || "Loyiha",
      category: (CATEGORIES as readonly string[]).includes(category) ? category : "web",
      year: int(fd, "year", new Date().getFullYear()),
      client: s(fd, "client", 120),
      duration: s(fd, "duration", 40),
      url: safeUrl(s(fd, "url", 300)),
      description: s(fd, "description", 600),
      task: s(fd, "task", 3000),
      solution: s(fd, "solution", 3000),
      services: s(fd, "services", 600).split(",").map((x) => x.trim()).filter(Boolean).slice(0, 12),
      results,
      color: color(fd, "color", "#1d3b8b"),
      accent: color(fd, "accent", "#22d3ee"),
      visual: (VISUALS as readonly string[]).includes(visual) ? visual : "logo",
      logoText: s(fd, "logoText", 60),
      published: fd.get("published") === "on",
    } as const;

    if (existing) {
      const keep = existing.gallery.filter((g) => !removeGallery.has(g));
      toDelete.push(...existing.gallery.filter((g) => removeGallery.has(g)));
      let nextCover = existing.cover;
      if (cover || fd.get("cover_remove") === "on") { toDelete.push(existing.cover); nextCover = cover; }
      Object.assign(existing, base, { cover: nextCover, gallery: [...keep, ...gallery] });
    } else {
      savedId = newId("p");
      c.projects.push({ id: savedId, ...base, cover, gallery, order: nextOrder(c.projects) });
    }
  }, uploaded);
  if (err) return err;
  await Promise.all(toDelete.map(deleteUpload));
  refresh();
  if (!id) redirect(`/admin/projects/${savedId}?created=1`);
  return done("Loyiha saqlandi");
}

export async function deleteProject(fd: FormData) {
  await requireAdmin();
  const id = s(fd, "id", 40);
  let files: (string | null)[] = [];
  await updateContent((c) => {
    const p = c.projects.find((x) => x.id === id);
    if (p) files = [p.cover, ...p.gallery];
    c.projects = c.projects.filter((x) => x.id !== id);
  });
  await Promise.all(files.map(deleteUpload));
  refresh();
  if (fd.get("back")) redirect("/admin/projects");
}

export async function moveProject(fd: FormData) {
  await requireAdmin();
  await updateContent((c) => move(c.projects, s(fd, "id", 40), int(fd, "dir")));
  refresh();
}

export async function toggleProject(fd: FormData) {
  await requireAdmin();
  await updateContent((c) => { const p = c.projects.find((x) => x.id === s(fd, "id", 40)); if (p) p.published = !p.published; });
  refresh();
}

/* ---------- clients ---------- */
export async function saveClient(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = s(fd, "id", 40);
  const name = s(fd, "name", 80);
  if (!name) return fail("Mijoz nomini kiriting.");
  let logo: string | null;
  try { logo = await saveUpload(fd.get("logo")); } catch (e) { if (e instanceof UploadError) return fail(e.message); throw e; }
  let old: string | null = null;
  const err = await save((c) => {
    const ex = id ? c.clients.find((x) => x.id === id) : undefined;
    const url = safeUrl(s(fd, "url", 300));
    if (ex) {
      if (logo || fd.get("logo_remove") === "on") { old = ex.logo; ex.logo = logo; }
      Object.assign(ex, { name, url });
    } else c.clients.push({ id: newId("c"), name, url, logo, order: nextOrder(c.clients) });
  }, [logo]);
  if (err) return err;
  await deleteUpload(old);
  refresh();
  return done(id ? "Mijoz saqlandi" : "Mijoz qo'shildi");
}

export async function deleteClient(fd: FormData) {
  await requireAdmin();
  let logo: string | null = null;
  await updateContent((c) => { const x = c.clients.find((k) => k.id === s(fd, "id", 40)); logo = x?.logo ?? null; c.clients = c.clients.filter((k) => k !== x); });
  await deleteUpload(logo);
  refresh();
}
export async function moveClient(fd: FormData) { await requireAdmin(); await updateContent((c) => move(c.clients, s(fd, "id", 40), int(fd, "dir"))); refresh(); }

/* ---------- FAQ ---------- */
export async function saveFaq(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = s(fd, "id", 40), question = s(fd, "question", 300), answer = s(fd, "answer", 3000);
  if (!question || !answer) return fail("Savol va javobni to'ldiring.");
  const err = await save((c) => {
    const ex = id ? c.faq.find((x) => x.id === id) : undefined;
    if (ex) Object.assign(ex, { question, answer });
    else c.faq.push({ id: newId("f"), question, answer, order: nextOrder(c.faq) });
  });
  if (err) return err;
  refresh();
  return done(id ? "Savol saqlandi" : "Savol qo'shildi");
}
export async function deleteFaq(fd: FormData) { await requireAdmin(); await updateContent((c) => { c.faq = c.faq.filter((x) => x.id !== s(fd, "id", 40)); }); refresh(); }
export async function moveFaq(fd: FormData) { await requireAdmin(); await updateContent((c) => move(c.faq, s(fd, "id", 40), int(fd, "dir"))); refresh(); }

/* ---------- testimonials ---------- */
export async function saveTestimonial(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = s(fd, "id", 40), name = s(fd, "name", 120), text = s(fd, "text", 1200);
  if (!name || !text) return fail("Ism va fikr matnini kiriting.");
  const data = { name, text, role: s(fd, "role", 160), color: color(fd, "color", "#22d3ee") };
  const err = await save((c) => {
    const ex = id ? c.testimonials.find((x) => x.id === id) : undefined;
    if (ex) Object.assign(ex, data);
    else c.testimonials.push({ id: newId("t"), ...data, order: nextOrder(c.testimonials) });
  });
  if (err) return err;
  refresh();
  return done(id ? "Fikr saqlandi" : "Fikr qo'shildi");
}
export async function deleteTestimonial(fd: FormData) { await requireAdmin(); await updateContent((c) => { c.testimonials = c.testimonials.filter((x) => x.id !== s(fd, "id", 40)); }); refresh(); }
export async function moveTestimonial(fd: FormData) { await requireAdmin(); await updateContent((c) => move(c.testimonials, s(fd, "id", 40), int(fd, "dir"))); refresh(); }

/* ---------- team ---------- */
export async function saveMember(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = s(fd, "id", 40), name = s(fd, "name", 120);
  if (!name) return fail("Ismni kiriting.");
  let photo: string | null;
  try { photo = await saveUpload(fd.get("photo")); } catch (e) { if (e instanceof UploadError) return fail(e.message); throw e; }
  const data = { name, role: s(fd, "role", 120), color: color(fd, "color", "#0e7490") };
  let old: string | null = null;
  const err = await save((c) => {
    const ex = id ? c.team.find((x) => x.id === id) : undefined;
    if (ex) {
      if (photo || fd.get("photo_remove") === "on") { old = ex.photo; ex.photo = photo; }
      Object.assign(ex, data);
    } else c.team.push({ id: newId("u"), ...data, photo, order: nextOrder(c.team) });
  }, [photo]);
  if (err) return err;
  await deleteUpload(old);
  refresh();
  return done(id ? "Saqlandi" : "Jamoa a'zosi qo'shildi");
}
export async function deleteMember(fd: FormData) {
  await requireAdmin();
  let photo: string | null = null;
  await updateContent((c) => { const x = c.team.find((k) => k.id === s(fd, "id", 40)); photo = x?.photo ?? null; c.team = c.team.filter((k) => k !== x); });
  await deleteUpload(photo);
  refresh();
}
export async function moveMember(fd: FormData) { await requireAdmin(); await updateContent((c) => move(c.team, s(fd, "id", 40), int(fd, "dir"))); refresh(); }

/* ---------- messages & subscribers ---------- */
export async function toggleMessage(fd: FormData) {
  await requireAdmin();
  await updateContent((c) => { const m = c.messages.find((x) => x.id === s(fd, "id", 40)); if (m) m.read = !m.read; });
  revalidatePath("/admin", "layout");
}
export async function deleteMessage(fd: FormData) {
  await requireAdmin();
  await updateContent((c) => { c.messages = c.messages.filter((x) => x.id !== s(fd, "id", 40)); });
  revalidatePath("/admin", "layout");
}
export async function deleteSubscriber(fd: FormData) {
  await requireAdmin();
  await updateContent((c) => { c.subscribers = c.subscribers.filter((x) => x.email !== s(fd, "email", 160)); });
  revalidatePath("/admin", "layout");
}

/* ---------- settings ---------- */
export async function saveSettings(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const words = s(fd, "heroWords", 1000).split("\n").map((w) => w.trim()).filter(Boolean).slice(0, 10);
  if (!words.length) return fail("Kamida bitta hero so'zini kiriting.");
  const settings: Content["settings"] = {
    heroWords: words,
    stats: { projects: int(fd, "projects"), clients: int(fd, "clients"), years: int(fd, "years"), team: int(fd, "team") },
    phone: s(fd, "phone", 40),
    email: s(fd, "email", 160),
    telegram: s(fd, "telegram", 60).replace(/^@/, ""),
    address: s(fd, "address", 160),
  };
  const err = await save((c) => { c.settings = settings; });
  if (err) return err;
  refresh();
  return done("Sozlamalar saqlandi");
}
