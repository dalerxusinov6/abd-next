import { MIME, readUpload } from "@/lib/uploads";

/* Serves admin-uploaded images (Vercel Blob in production, storage/uploads locally). */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const file = await readUpload(name);
  if (!file) return new Response("Not found", { status: 404 });
  const ext = name.split(".").pop() as string;
  return new Response(file, {
    headers: {
      "Content-Type": MIME[ext] || "application/octet-stream",
      // file names are random UUIDs and never reused, so they can be cached forever
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // uploaded SVGs must never run scripts if opened directly
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
