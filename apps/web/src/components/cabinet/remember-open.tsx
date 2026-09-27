"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function RememberOpen({ materialId }: { materialId: string }) {
  const router = useRouter();
  const sent = useRef<string | null>(null);

  useEffect(() => {
    if (sent.current === materialId) return;
    sent.current = materialId;
    void fetch(`/v1/me/progress/${materialId}/open`, { method: "POST", credentials: "include" }).then((response) => {
      if (response.ok) router.refresh();
    });
  }, [materialId, router]);

  return null;
}
