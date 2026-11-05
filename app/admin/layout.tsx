import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin — ABD Group" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return children;
}
