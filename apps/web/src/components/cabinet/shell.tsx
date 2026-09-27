"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Icon, Logo, type IconName } from "@nina/ui";

const items: { href: string; label: string; icon: IconName }[] = [
  { href: "/app", label: "მთავარი", icon: "home" },
  { href: "/app/lessons", label: "გაკვეთილები", icon: "lessons" },
  { href: "/app/materials", label: "მასალები", icon: "materials" },
  { href: "/app/vocabulary", label: "ლექსიკა", icon: "vocabulary" },
  { href: "/app/progress", label: "პროგრესი", icon: "progress" },
];

function active(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Shell({ name, children }: { name: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/v1/auth/sign-out", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-paper lg:pl-[248px]">
      <aside className="fixed inset-y-0 left-0 hidden w-[248px] flex-col gap-1 border-r border-line bg-paper-deep px-4 py-6 lg:flex">
        <Logo className="mb-6 ml-2.5 h-auto w-[84px]" />
        {items.map((item) => {
          const on = active(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={on ? "page" : undefined}
              className={`flex h-12 items-center gap-3 rounded-xl px-3.5 text-[15px] ${on ? "bg-teal-deep font-semibold text-on-dark" : "font-medium text-ink hover:bg-line-soft"}`}
            >
              <Icon name={item.icon} width={22} height={22} />
              {item.label}
            </Link>
          );
        })}
        <div className="mt-auto flex items-center gap-2.5 border-t border-line px-2.5 pt-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-burgundy-soft font-bold text-burgundy">{name.slice(0, 1)}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{name}</p>
            <button type="button" className="text-[13px] text-ink-muted" onClick={signOut}>
              გასვლა
            </button>
          </div>
        </div>
      </aside>
      <main className="px-5 py-8 pb-28 lg:px-14 lg:py-11 lg:pb-11">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="კაბინეტი">
        {items.map((item) => {
          const on = active(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={on ? "page" : undefined}
              className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] ${on ? "font-semibold text-teal-deep" : "text-ink-muted"}`}
            >
              <Icon name={item.icon} width={22} height={22} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
