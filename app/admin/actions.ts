"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, createSession, destroySession, isConfigured, rateLimited, requireAdmin } from "@/lib/auth";
import { newId, readContent, slugify, updateContent } from "@/lib/store";
import { deleteUpload, saveUpload, UploadError } from "@/lib/uploads";
import { CATEGORIES, VISUALS, type ActionState, type Category, type Content, type Result, type Visual } from "@/lib/types";
import { EXTRA_LANGS, type Tr } from "@/lib/i18n";
import { toNewLatin } from "@/lib/uzLatin";
import { canTranslate, translateFields, type Fields } from "@/lib/translate";

/* ---------- helpers ---------- */
const s = (fd: FormData, k: string, max = 500) => String(fd.get(k) ?? "").trim().slice(0, max);
/** Uzbek text field: stored in the new Latin alphabet whichever way it was typed. Not for names. */
const uz = (fd: FormData, k: string, max = 500) => toNewLatin(s(fd, k, max));
const int = (fd: FormData, k: string, fallback = 0) => { const n = parseInt(s(fd, k, 12), 10); return Number.isFinite(n) ? n : fallback; };
const color = (fd: FormData, k: string, fallback: string) => { const v = s(fd, k, 9); return /^#[0-9a-f]{6}$/i.test(v) ? v : fallback; };
const safeUrl = (v: string) => (/^https?:\/\/[^\s]+$/i.test(v) ? v : "");
/*
 * Reads the RU/EN fields of a form (named "tr.ru.<field>", see components/admin/TrFields.tsx).
 * Empty values are dropped, so the site falls back to Uzbek for them.
 */
type TrSpec = Record<string, { max: number; kind?: "text" | "list" | "lines" }>;
function readTr<T>(fd: FormData, spec: TrSpec): Tr<T> | undefined {
  const out: Record<string, Record<string, string | string[]>> = {};
  for (const l of EXTRA_LANGS) {
    const one: Record<string, string | string[]> = {};
    for (const [k, { max, kind = "text" }] of Object.entries(spec)) {
      const v = s(fd, `tr.${l}.${k}`, max);
      if (!v) continue;
      one[k] = kind === "text" ? v : v.split(kind === "list" ? "," : "\n").map((x) => x.trim()).filter(Boolean).slice(0, 12);
    }
    if (Object.keys(one).length) out[l] = one;
  }
  return Object.keys(out).length ? (out as Tr<T>) : undefined;
}

/*
 * Fills the RU/EN versions of Uzbek fields automatically (Claude, see lib/translate.ts).
 * A field is (re)translated for a language when:
 *   - its translation is empty, or
 *   - the Uzbek text changed and the translation was left as it was (so it is stale), or
 *   - the admin ticked "re-translate everything" (tr_redo).
 * A translation the admin typed or edited in the same save is never overwritten.
 */
type TrObj = Partial<Record<"ru" | "en", Record<string, unknown>>>;
const isEmpty = (v: unknown) => v == null || (typeof v === "string" ? !v.trim() : Array.isArray(v) ? !v.some((x) => String(x).trim()) : false);
const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

async function autoTr(fd: FormData, now: Fields, before: Fields | undefined, tr: TrObj | undefined, trBefore: TrObj | undefined, context: string): Promise<{ tr: TrObj | undefined; note?: string }> {
  if (!canTranslate()) return { tr };
  const redo = fd.get("tr_redo") === "on";
  const need: Record<"ru" | "en", string[]> = { ru: [], en: [] };
  for (const [f, v] of Object.entries(now)) {
    if (isEmpty(v)) continue;
    const changed = before !== undefined && !same(before[f], v);
    for (const l of EXTRA_LANGS) {
      const sub = tr?.[l]?.[f];
      if (redo || isEmpty(sub) || (changed && same(sub, trBefore?.[l]?.[f]))) need[l].push(f);
    }
  }
  const keys = [...new Set([...need.ru, ...need.en])];
  if (!keys.length) return { tr };
  try {
    const got = await translateFields(Object.fromEntries(keys.map((k) => [k, now[k]])), context);
    const out: TrObj = structuredClone(tr ?? {});
    for (const l of EXTRA_LANGS) for (const f of need[l]) {
      const v = got[l]?.[f];
      if (isEmpty(v)) continue;
      // a list must keep its length (e.g. services, result labels)
      if (Array.isArray(now[f]) && (!Array.isArray(v) || v.length !== (now[f] as string[]).length)) continue;
      (out[l] ??= {})[f] = v;
    }
    return { tr: Object.keys(out).length ? out : undefined };
  } catch (e) {
    console.error("[admin] auto-translation failed", e);
    return { tr, note: "Saqlandi, lekin avtomatik tarjima ishlamadi — RU/EN maydonlarini qo'lda to'ldiring yoki qayta saqlang." };
  }
}

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
    .map((i) => ({ value: uz(fd, `r${i}_value`, 30), label: uz(fd, `r${i}_label`, 80) }))
    .filter((r) => r.value || r.label);
  const tr = readTr<Record<string, unknown>>(fd, {
    name: { max: 120 }, type: { max: 60 }, duration: { max: 40 }, description: { max: 600 },
    task: { max: 3000 }, solution: { max: 3000 }, services: { max: 600, kind: "list" },
    r0_value: { max: 30 }, r1_value: { max: 30 }, r2_value: { max: 30 },
    r0_label: { max: 80 }, r1_label: { max: 80 }, r2_label: { max: 80 },
  });
  // translated results: empty value/label falls back to the Uzbek one (+65%, 3x, …)
  for (const one of Object.values(tr ?? {}) as Record<string, unknown>[]) {
    const pick = (k: string) => [0, 1, 2].map((i) => { const v = one[`r${i}_${k}`] as string | undefined; delete one[`r${i}_${k}`]; return v; });
    const values = pick("value"), labels = pick("label");
    if ([...values, ...labels].some(Boolean)) one.results = results.map((r, i): Result => ({ value: values[i] || r.value, label: labels[i] || r.label }));
  }
  // Uzbek texts, then their RU/EN versions (results as two lists so they translate in one go)
  const text = {
    type: uz(fd, "type", 60) || "Loyiha",
    duration: uz(fd, "duration", 40),
    description: uz(fd, "description", 600),
    task: uz(fd, "task", 3000),
    solution: uz(fd, "solution", 3000),
    services: uz(fd, "services", 600).split(",").map((x) => x.trim()).filter(Boolean).slice(0, 12),
  };
  const asFields = (t: Record<string, unknown> | undefined, res: Result[] | undefined): Fields | undefined => t && ({
    ...Object.fromEntries(["type", "duration", "description", "task", "solution", "services"].map((k) => [k, t[k] as string | string[]])),
    resultLabels: (res ?? []).map((r) => r.label), resultValues: (res ?? []).map((r) => r.value),
  });
  const trAsFields = (t: TrObj | undefined) => t && Object.fromEntries(Object.entries(t).map(([l, v]) => {
    const { results: res, ...rest } = (v ?? {}) as Record<string, unknown> & { results?: Result[] };
    return [l, res ? { ...rest, resultLabels: res.map((r) => r.label), resultValues: res.map((r) => r.value) } : rest];
  })) as TrObj;
  const prev = id ? (await readContent()).projects.find((p) => p.id === id) : undefined;
  const auto = await autoTr(fd, asFields(text, results)!, prev && asFields(prev as unknown as Record<string, unknown>, prev.results), trAsFields(tr as TrObj), trAsFields(prev?.tr as TrObj), `portfolio project "${name}"`);
  // back from two lists to results; a missing value/label falls back to the Uzbek one
  const trFinal = auto.tr && Object.fromEntries(Object.entries(auto.tr).map(([l, v]) => {
    const { resultLabels, resultValues, ...rest } = (v ?? {}) as Record<string, unknown> & { resultLabels?: string[]; resultValues?: string[] };
    const hasRes = (resultLabels?.length || resultValues?.length) && results.length;
    return [l, hasRes ? { ...rest, results: results.map((r, i): Result => ({ value: resultValues?.[i] || r.value, label: resultLabels?.[i] || r.label })) } : rest];
  }));

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
      type: text.type,
      category: (CATEGORIES as readonly string[]).includes(category) ? category : "web",
      year: int(fd, "year", new Date().getFullYear()),
      duration: text.duration,
      url: safeUrl(s(fd, "url", 300)),
      description: text.description,
      task: text.task,
      solution: text.solution,
      services: text.services,
      results,
      color: color(fd, "color", "#1d3b8b"),
      accent: color(fd, "accent", "#00c8ff"),
      visual: (VISUALS as readonly string[]).includes(visual) ? visual : "logo",
      logoText: s(fd, "logoText", 60),
      published: fd.get("published") === "on",
      tr: trFinal as Content["projects"][number]["tr"],
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
  return done(auto.note ?? "Loyiha saqlandi");
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
  const id = s(fd, "id", 40), question = uz(fd, "question", 300), answer = uz(fd, "answer", 3000);
  if (!question || !answer) return fail("Savol va javobni to'ldiring.");
  const prev = id ? (await readContent()).faq.find((x) => x.id === id) : undefined;
  const auto = await autoTr(fd, { question, answer }, prev && { question: prev.question, answer: prev.answer },
    readTr(fd, { question: { max: 300 }, answer: { max: 3000 } }) as TrObj, prev?.tr as TrObj, "FAQ question and answer on the website");
  const tr = auto.tr as Content["faq"][number]["tr"];
  const err = await save((c) => {
    const ex = id ? c.faq.find((x) => x.id === id) : undefined;
    if (ex) Object.assign(ex, { question, answer, tr });
    else c.faq.push({ id: newId("f"), question, answer, tr, order: nextOrder(c.faq) });
  });
  if (err) return err;
  refresh();
  return done(auto.note ?? (id ? "Savol saqlandi" : "Savol qo'shildi"));
}
export async function deleteFaq(fd: FormData) { await requireAdmin(); await updateContent((c) => { c.faq = c.faq.filter((x) => x.id !== s(fd, "id", 40)); }); refresh(); }
export async function moveFaq(fd: FormData) { await requireAdmin(); await updateContent((c) => move(c.faq, s(fd, "id", 40), int(fd, "dir"))); refresh(); }

/* ---------- testimonials ---------- */
export async function saveTestimonial(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = s(fd, "id", 40), name = s(fd, "name", 120), text = uz(fd, "text", 1200);
  if (!name || !text) return fail("Ism va fikr matnini kiriting.");
  const role = uz(fd, "role", 160);
  const prev = id ? (await readContent()).testimonials.find((x) => x.id === id) : undefined;
  const auto = await autoTr(fd, { role, text }, prev && { role: prev.role, text: prev.text },
    readTr(fd, { role: { max: 160 }, text: { max: 1200 } }) as TrObj, prev?.tr as TrObj, `client review by ${name}; "role" is their job title and company`);
  const data = { name, text, role, color: color(fd, "color", "#00c8ff"), tr: auto.tr as Content["testimonials"][number]["tr"] };
  const err = await save((c) => {
    const ex = id ? c.testimonials.find((x) => x.id === id) : undefined;
    if (ex) Object.assign(ex, data);
    else c.testimonials.push({ id: newId("t"), ...data, order: nextOrder(c.testimonials) });
  });
  if (err) return err;
  refresh();
  return done(auto.note ?? (id ? "Fikr saqlandi" : "Fikr qo'shildi"));
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
  const role = uz(fd, "role", 120);
  const prev = id ? (await readContent()).team.find((x) => x.id === id) : undefined;
  const auto = await autoTr(fd, { role }, prev && { role: prev.role }, readTr(fd, { role: { max: 120 } }) as TrObj, prev?.tr as TrObj,
    "job title of a team member (keep common English titles like Art Director in English for the English version)");
  const data = { name, role, color: color(fd, "color", "#0e7490"), tr: auto.tr as Content["team"][number]["tr"] };
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
  return done(auto.note ?? (id ? "Saqlandi" : "Jamoa a'zosi qo'shildi"));
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
  const words = uz(fd, "heroWords", 1000).split("\n").map((w) => w.trim()).filter(Boolean).slice(0, 10);
  if (!words.length) return fail("Kamida bitta hero so'zini kiriting.");
  const address = uz(fd, "address", 160);
  const prev = (await readContent()).settings;
  const auto = await autoTr(fd, { heroWords: words, address }, { heroWords: prev.heroWords, address: prev.address },
    readTr(fd, { heroWords: { max: 1000, kind: "lines" }, address: { max: 160 } }) as TrObj, prev.tr as TrObj,
    'heroWords are short plural nouns completing the headline "We build ___ for your business" / "Создаём ___ для вашего бизнеса" (Russian in the accusative, lowercase); address is the company city and country');
  const settings: Content["settings"] = {
    heroWords: words,
    stats: { projects: int(fd, "projects"), clients: int(fd, "clients"), years: int(fd, "years"), team: int(fd, "team") },
    phone: s(fd, "phone", 40),
    email: s(fd, "email", 160),
    telegram: s(fd, "telegram", 60).replace(/^@/, ""),
    address,
    tr: auto.tr as Content["settings"]["tr"],
  };
  const err = await save((c) => { c.settings = settings; });
  if (err) return err;
  refresh();
  return done(auto.note ?? "Sozlamalar saqlandi");
}
