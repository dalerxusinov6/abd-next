"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Bosh panel" },
  { href: "/admin/projects", label: "Loyihalar" },
  { href: "/admin/clients", label: "Mijozlar logolari" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/team", label: "Jamoa" },
  { href: "/admin/testimonials", label: "Fikrlar" },
  { href: "/admin/messages", label: "Xabarlar", badge: true },
  { href: "/admin/settings", label: "Sozlamalar" },
];

export default function AdminNav({ unread }: { unread: number }) {
  const path = usePathname();
  return (
    <nav className="a-nav" aria-label="Admin menyu">
      {ITEMS.map((i) => {
        const active = i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
            {i.label}
            {i.badge && unread > 0 && <span className="a-badge">{unread}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
