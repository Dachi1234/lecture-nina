"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { withLesson } from "@/lib/materials";

export function RememberOpen({ materialId, lessonId }: { materialId: string; lessonId: string | null }) {
  const router = useRouter();
  const sent = useRef<string | null>(null);

  useEffect(() => {
    const key = `${lessonId}:${materialId}`;
    if (sent.current === key) return;
    sent.current = key;
    void fetch(withLesson(`/v1/me/progress/${materialId}/open`, lessonId), { method: "POST", credentials: "include" }).then((response) => {
      if (response.ok) router.refresh();
    });
  }, [materialId, lessonId, router]);

  return null;
}
