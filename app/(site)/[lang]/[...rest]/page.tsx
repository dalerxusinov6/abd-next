import { notFound } from "next/navigation";

/** Any unknown site URL (/foo, /ru/foo/bar) shows the 404 inside the site layout. */
export default function Unknown() {
  notFound();
}
