"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@nina/ui";
import { send } from "@/lib/client";

export function LegacyCopyButton({ legacyId, copiedTo, size = "m" }: { legacyId: string; copiedTo: string | null; size?: "s" | "m" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (copiedTo) {
    return (
      <Link href={`/admin/library/${copiedTo}`} className={`inline-flex items-center rounded-xl border-[1.5px] border-sage px-4 font-semibold whitespace-nowrap text-sage-ink ${size === "s" ? "h-10 text-sm" : "h-12 text-[15px]"}`}>
        ✓ ახალ ბიბლიოთეკაშია →
      </Link>
    );
  }
  return (
    <span className="flex flex-col items-end gap-1">
      <Button
        size={size}
        variant="outline"
        loading={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          const result = await send<{ id: string }>("POST", `/v1/admin/legacy/${legacyId}/copy`);
          setBusy(false);
          if (!result.ok) return setError(result.message);
          router.push(`/admin/library/${result.data.id}`);
        }}
      >
        ახალ ბიბლიოთეკაში კოპირება
      </Button>
      {error ? <span className="text-[13px] text-burgundy">{error}</span> : null}
    </span>
  );
}
