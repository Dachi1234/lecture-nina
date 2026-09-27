"use client";

import { Logo } from "@nina/ui";
import { useEffect, useState } from "react";
import { landing } from "@/content/landing.ka";
import { BookButton } from "./booking";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const nodes = landing.nav.map((item) => document.getElementById(item.id)).filter((node) => node !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const current = visible[0]?.target.id;
        if (current) setActive(current);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  return (
    <header className={`sticky top-0 z-30 border-b transition-[height,background-color,box-shadow] ${scrolled ? "h-[68px] border-sand bg-paper shadow-[0_8px_24px_-18px_rgba(10,65,79,0.45)]" : "h-[88px] border-transparent bg-paper/90"}`}>
      <div className="mx-auto flex h-full max-w-[1280px] items-center gap-4 px-5 md:px-10">
        <a href="#top" aria-label={landing.hero.ariaLabel}>
          <Logo className={scrolled ? "h-[52px]" : "h-[68px] max-md:h-[52px]"} />
        </a>
        <nav className="ml-6 hidden items-center gap-5 lg:flex" aria-label="მთავარი">
          {landing.nav.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`text-base font-medium hover:text-burgundy ${active === item.id ? "text-burgundy underline decoration-mustard decoration-2 underline-offset-8" : "text-navy"}`}
              aria-current={active === item.id ? "true" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <a href="/login" className="inline-flex h-12 items-center gap-2 px-3 font-semibold text-teal-deep">
            <UserIcon />
            {landing.login}
          </a>
          <BookButton source="header" size="m" arrow={false} />
        </div>
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <BookButton source="header" size="s" arrow={false}>
            {landing.ctaShort}
          </BookButton>
          <button type="button" className="inline-flex size-11 items-center justify-center rounded-xl" aria-label={landing.menuLabel} aria-expanded={menu} onClick={() => setMenu(true)}>
            <MenuIcon />
          </button>
        </div>
      </div>
      {menu ? (
        <div className="fixed inset-0 z-40 flex flex-col bg-paper px-6 py-6 lg:hidden">
          <div className="flex items-center justify-between">
            <Logo className="h-[52px]" />
            <button type="button" className="inline-flex size-11 items-center justify-center" aria-label={landing.close} onClick={() => setMenu(false)}>
              ×
            </button>
          </div>
          <nav className="mt-10 flex flex-col gap-5" aria-label="მობილური">
            {landing.nav.map((item) => (
              <a key={item.id} href={item.href} className="text-[26px] font-semibold" onClick={() => setMenu(false)}>
                {item.label}
              </a>
            ))}
          </nav>
          <img src="/illustrations/spots/spot-walking.webp" alt="" className="mx-auto mt-auto h-40" />
          <p className="mb-6 text-center font-hand text-4xl text-teal-deep">{landing.menuNote}</p>
          <BookButton source="menu" className="w-full" onOpen={() => setMenu(false)} />
          <a href="/login" className="mt-4 text-center font-semibold text-teal-deep">
            {landing.login}
          </a>
        </div>
      ) : null}
    </header>
  );
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.5c1.4-3.2 3.4-4.8 7-4.8s5.6 1.6 7 4.8" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
