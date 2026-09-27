"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@nina/ui";

export function MarkDone({ materialId }: { materialId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function complete(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    setLoading(true);
    setError("");
    const response = await fetch(`/v1/me/progress/${materialId}/complete`, { method: "POST", credentials: "include" });
    setLoading(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: { messageKa?: string } } | null;
      setError(body?.error?.messageKa ?? "ვერ შეინახა.");
      return;
    }
    router.refresh();
  }

  return (
    <span className="flex flex-col items-end gap-1">
      <Button type="button" size="s" variant="outline" loading={loading} onClick={complete} className="whitespace-nowrap">
        ✓ მონიშნე დასრულებულად
      </Button>
      {error ? <span className="text-[13px] font-medium text-burgundy">{error}</span> : null}
    </span>
  );
}
