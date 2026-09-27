import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Shell } from "@/components/cabinet/shell";
import { ApiError, apiGet } from "@/lib/api";

export const dynamic = "force-dynamic";

type Me = { name: string; role?: string };

export default async function CabinetLayout({ children }: { children: ReactNode }) {
  let me: Me;
  try {
    me = await apiGet<Me>("/v1/me");
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 404)) redirect("/login");
    throw error;
  }
  if (me.role === "ADMIN") redirect("/admin");
  return <Shell name={me.name}>{children}</Shell>;
}
