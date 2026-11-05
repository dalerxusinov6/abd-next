import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { del, get, put } from "@vercel/blob";
import { useBlob } from "./store";

export const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");
export const SAFE_NAME = /^[a-f0-9-]{36}\.(png|jpg|webp|gif|svg|avif)$/;
const MAX_BYTES = 8 * 1024 * 1024;

const TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

export const MIME: Record<string, string> = Object.fromEntries(Object.entries(TYPES).map(([m, e]) => [e, m]));

/** Checks the first bytes so a renamed file cannot pretend to be an image. */
function looksLike(ext: string, b: Buffer) {
  switch (ext) {
    case "png": return b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case "jpg": return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    case "gif": return b.subarray(0, 4).toString("ascii") === "GIF8";
    case "webp": return b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP";
    case "avif": return b.subarray(4, 12).toString("ascii").startsWith("ftyp");
    case "svg": { const head = b.subarray(0, 512).toString("utf8").trimStart().toLowerCase(); return head.startsWith("<svg") || head.startsWith("<?xml"); }
    default: return false;
  }
}

export class UploadError extends Error {}

/** Returns the public URL (/uploads/…) or null when no file was chosen. */
export async function saveUpload(value: FormDataEntryValue | null): Promise<string | null> {
  if (!value || typeof value === "string" || value.size === 0) return null;
  const ext = TYPES[value.type];
  if (!ext) throw new UploadError(`"${value.name}" — faqat PNG, JPG, WEBP, GIF, SVG yoki AVIF rasm yuklash mumkin.`);
  if (value.size > MAX_BYTES) throw new UploadError(`"${value.name}" juda katta (maksimum 8 MB).`);
  const buf = Buffer.from(await value.arrayBuffer());
  if (!looksLike(ext, buf)) throw new UploadError(`"${value.name}" haqiqiy rasm fayliga o'xshamaydi.`);
  const name = `${randomUUID()}.${ext}`;
  if (useBlob()) {
    await put(`uploads/${name}`, buf, { access: "private", contentType: value.type, addRandomSuffix: false });
  } else {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  }
  return `/uploads/${name}`;
}

export async function deleteUpload(url: string | null | undefined) {
  if (!url || !url.startsWith("/uploads/")) return;
  const name = path.basename(url);
  if (!SAFE_NAME.test(name)) return;
  if (useBlob()) await del(`uploads/${name}`).catch(() => undefined);
  else await fs.rm(path.join(UPLOAD_DIR, name), { force: true });
}

/** Raw bytes of an uploaded image, or null when it does not exist. */
export async function readUpload(name: string): Promise<Uint8Array<ArrayBuffer> | null> {
  if (!SAFE_NAME.test(name)) return null;
  if (useBlob()) {
    const res = await get(`uploads/${name}`, { access: "private" }).catch(() => null);
    if (!res || res.statusCode !== 200) return null;
    return new Uint8Array(await new Response(res.stream).arrayBuffer());
  }
  try {
    return new Uint8Array(await fs.readFile(path.join(UPLOAD_DIR, name)));
  } catch {
    return null;
  }
}
