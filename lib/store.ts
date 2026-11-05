import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { get, put } from "@vercel/blob";
import seed from "@/data/seed.json";
import type { Content } from "./types";

/*
 * Content store with two backends:
 *  - Vercel Blob (private) when BLOB_READ_WRITE_TOKEN is set — used on Vercel,
 *    where the filesystem is read-only. Writes use ETag checks so two admins
 *    saving at once cannot overwrite each other.
 *  - A local JSON file (storage/content.json) otherwise — for dev or a VPS.
 */
export const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const BLOB_KEY = "data/content.json";
const DIR = path.join(process.cwd(), "storage");
const FILE = path.join(DIR, "content.json");

const fresh = () => structuredClone(seed) as unknown as Content;

/** Older content files get sample data for sections added later. */
function withDefaults(content: Content): Content {
  const defaults = seed as unknown as Content;
  for (const key of Object.keys(defaults) as (keyof Content)[]) {
    if (content[key] === undefined) (content as Record<string, unknown>)[key] = structuredClone(defaults[key]);
  }
  return content;
}

/* ---------- Vercel Blob backend ---------- */
async function blobRead(): Promise<{ content: Content; etag: string | null }> {
  const res = await get(BLOB_KEY, { access: "private", useCache: false });
  if (!res || res.statusCode !== 200) return { content: fresh(), etag: null };
  const text = await new Response(res.stream).text();
  // get() reports a weak ETag (W/"…") because the body may be compressed;
  // put({ ifMatch }) compares against the strong form of the same hash.
  return { content: withDefaults(JSON.parse(text) as Content), etag: res.blob.etag.replace(/^W\//, "") };
}

async function blobWrite(content: Content, etag: string | null) {
  await put(BLOB_KEY, JSON.stringify(content), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: etag !== null,
    ...(etag ? { ifMatch: etag } : {}),
    cacheControlMaxAge: 60,
  });
}

const isConflict = (e: unknown) => {
  const name = (e as Error)?.name ?? "";
  const msg = (e as Error)?.message ?? "";
  return name.includes("PreconditionFailed") || /precondition|already exists/i.test(msg);
};

/* ---------- local file backend ---------- */
let queue: Promise<unknown> = Promise.resolve();

async function fileRead(): Promise<Content> {
  try {
    return withDefaults(JSON.parse(await fs.readFile(FILE, "utf8")) as Content);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    const initial = fresh();
    try {
      await fs.mkdir(DIR, { recursive: true });
      await fs.writeFile(FILE, JSON.stringify(initial, null, 2));
    } catch {
      // read-only filesystem (e.g. Vercel without Blob): serve the sample content
    }
    return initial;
  }
}

/* ---------- public API ---------- */
export async function readContent(): Promise<Content> {
  return useBlob() ? (await blobRead()).content : fileRead();
}

export async function updateContent(mutate: (c: Content) => void | Promise<void>): Promise<Content> {
  if (useBlob()) {
    for (let attempt = 0; ; attempt++) {
      const { content, etag } = await blobRead();
      await mutate(content);
      try {
        await blobWrite(content, etag);
        return content;
      } catch (e) {
        if (!isConflict(e) || attempt >= 4) throw e;
        await new Promise((r) => setTimeout(r, 80 * (attempt + 1)));
      }
    }
  }

  const run = queue.then(async () => {
    const content = await fileRead();
    await mutate(content);
    await fs.mkdir(DIR, { recursive: true });
    const tmp = `${FILE}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(content, null, 2));
    await fs.rename(tmp, FILE);
    return content;
  });
  queue = run.catch(() => undefined);
  return run;
}

export const byOrder = <T extends { order: number }>(list: T[]) => [...list].sort((a, b) => a.order - b.order);

export function newId(prefix: string) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[ʻʼ'`’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "loyiha";
}
