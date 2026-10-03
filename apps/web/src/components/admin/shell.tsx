"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/auth/sign-out";
import { Logo } from "@nina/ui";

type Item = { href: string; label: string; disabled?: boolean };

const sections: { label: string | null; items: Item[] }[] = [
  { label: null, items: [{ href: "/admin", label: "მთავარი" }] },
  {
    label: "სწავლება",
    items: [
      { href: "/admin/lessons", label: "გაკვეთილები" },
      { href: "/admin/students", label: "მოსწავლეები" },
      { href: "/admin/groups", label: "ჯგუფები" },
    ],
  },
  {
    label: "კონტენტი",
    items: [
      { href: "/admin/curriculum", label: "კურიკულუმი" },
      { href: "/admin/library", label: "ბიბლიოთეკა" },
      { href: "/admin/media", label: "მედია" },
      { href: "/admin/legacy", label: "ძველი ბიბლიოთეკა" },
    ],
  },
  {
    label: "ბიზნესი",
    items: [
      { href: "/admin/leads", label: "ლიდები" },
      { href: "/admin/social", label: "Social Studio" },
      { href: "/admin/assistant", label: "AI ასისტენტი", disabled: true },
      { href: "/admin/settings", label: "პარამეტრები" },
    ],
  },
];

const allItems = sections.flatMap((section) => section.items).filter((item) => !item.disabled);

function active(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/curriculum") return pathname.startsWith("/admin/curriculum") || pathname.startsWith("/admin/plans");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ name, children }: { name: string; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-paper lg:pl-[248px]">
      <aside className="fixed inset-y-0 left-0 hidden w-[248px] flex-col overflow-y-auto border-r border-line bg-paper-deep px-3 py-5 lg:flex">
        <Logo className="mb-4 ml-2 h-auto w-[84px]" />
        {sections.map((section) => (
          <div key={section.label ?? "home"} className="mb-3 flex flex-col gap-0.5">
            {section.label ? <p className="px-3 pt-1 pb-1 text-xs font-semibold text-ink-muted">{section.label}</p> : null}
            {section.items.map((item) => {
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
          </div>
        ))}
        <div className="mt-auto border-t border-line px-3 pt-3">
          <p className="truncate text-sm font-semibold">{name}</p>
          <SignOutButton />
        </div>
      </aside>
      <nav aria-label="ადმინი" className="sticky top-0 z-30 flex gap-1 overflow-x-auto border-b border-line bg-paper-deep px-3 py-2 lg:hidden">
        {allItems.map((item) => {
          const on = active(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={on ? "page" : undefined}
              className={`inline-flex h-11 shrink-0 items-center rounded-xl px-3 text-sm ${on ? "bg-teal-deep font-semibold text-on-dark" : "font-medium text-ink"}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <main className="px-5 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
