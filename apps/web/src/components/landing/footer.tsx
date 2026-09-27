import { Logo } from "@nina/ui";
import type { PublicSettings } from "@/lib/settings";
import { landing } from "@/content/landing.ka";

const copy = landing.footer;

export function Footer({ settings }: { settings: PublicSettings }) {
  return (
    <footer className="bg-navy text-on-dark">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-14 md:px-10 md:grid-cols-[144px_repeat(4,minmax(0,1fr))]">
        <div className="flex size-36 items-center justify-center rounded-full bg-paper">
          <Logo className="h-auto w-[118px]" />
        </div>
        <nav className="flex flex-col gap-3" aria-label="ქვედა ნავიგაცია">
          <p className="text-[13px] font-semibold tracking-wide text-mustard">{copy.site}</p>
          {landing.nav
            .filter((item) => ["nina", "metodo", "istorias", "precio"].includes(item.id))
            .map((item) => (
              <a key={item.id} href={item.href} className="hover:text-mustard">
                {item.label}
              </a>
            ))}
        </nav>
        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-semibold tracking-wide text-mustard">{copy.contact}</p>
          <Contact value={settings.contact_email} fallback={copy.email} />
          <Contact value={settings.contact_phone} fallback={copy.phone} />
          <Contact value={settings.telegram} fallback={copy.telegram} />
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-semibold tracking-wide text-mustard">{copy.social}</p>
          <Social href={settings.instagram_url} label={copy.instagram} />
          <Social href={settings.facebook_url} label={copy.facebook} />
          <Social href={settings.tiktok_url} label={copy.tiktok} />
        </div>
        <div className="flex flex-col items-start gap-3">
          <p className="text-[13px] font-semibold tracking-wide text-mustard">{copy.students}</p>
          <a href="/login" className="inline-flex h-12 items-center rounded-xl bg-paper px-5 font-semibold text-navy">
            {landing.loginCabinet}
          </a>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3 border-t border-on-dark/20 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-10">
        <p className="font-[family-name:var(--font-montserrat)] text-[17px] font-medium text-mustard italic">{copy.signature}</p>
        <p className="text-sm text-on-dark-muted">
          {copy.rights}
          <span className="mx-2">·</span>
          <a href="/privacy" className="underline">
            {copy.privacy}
          </a>
          <span className="mx-2">·</span>
          <a href="/terms" className="underline">
            {copy.terms}
          </a>
        </p>
      </div>
    </footer>
  );
}

function Contact({ value, fallback }: { value: string | null; fallback: string }) {
  if (!value) return <span>{fallback}</span>;
  const href = value.includes("@") ? `mailto:${value}` : value.startsWith("http") ? value : `tel:${value}`;
  return (
    <a href={href} className="hover:text-mustard">
      {value}
    </a>
  );
}

function Social({ href, label }: { href: string | null; label: string }) {
  if (!href) return <span>{label}</span>;
  return (
    <a href={href} className="hover:text-mustard">
      {label}
    </a>
  );
}
