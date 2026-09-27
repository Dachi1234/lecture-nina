"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/auth/sign-out";
import { Logo } from "@nina/ui";

const items: { href: string; label: string; disabled?: boolean }[] = [
  { href: "/admin", label: "მთავარი" },
  { href: "/admin/leads", label: "ლიდები" },
  { href: "/admin/students", label: "მოსწავლეები" },
  { href: "/admin/library", label: "ბიბლიოთეკა" },
  { href: "/admin/curriculum", label: "კურიკულუმი" },
  { href: "/admin/vocabulary", label: "ლექსიკა" },
  { href: "/admin/media", label: "მედია" },
  { href: "/admin/templates", label: "შაბლონები" },
  { href: "/admin/assistant", label: "AI ასისტენტი", disabled: true },
  { href: "/admin/social", label: "Social Studio" },
  { href: "/admin/settings", label: "პარამეტრები" },
];

function active(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ name, children }: { name: string; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-paper lg:pl-[248px]">
      <aside className="fixed inset-y-0 left-0 hidden w-[248px] flex-col gap-1 overflow-y-auto border-r border-line bg-paper-deep px-3 py-5 lg:flex">
        <Logo className="mb-4 ml-2 h-auto w-[84px]" />
        {items.map((item) => {
          if (item.disabled) {
            return (
              <span key={item.href} className="flex h-10 items-center justify-between rounded-xl px-3 text-sm text-ink-muted">
                {item.label}
                <span className="text-xs">მალე</span>
              </span>
            );
          }
          const on = active(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={on ? "page" : undefined}
              className={`flex h-10 items-center rounded-xl px-3 text-sm ${on ? "bg-teal-deep font-semibold text-on-dark" : "font-medium text-ink hover:bg-line-soft"}`}
            >
              {item.label}
            </Link>
          );
        })}
        <div className="mt-auto border-t border-line px-3 pt-3">
          <p className="truncate text-sm font-semibold">{name}</p>
          <SignOutButton />
        </div>
      </aside>
      <main className="px-5 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
