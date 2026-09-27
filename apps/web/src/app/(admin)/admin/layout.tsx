import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/shell";
import { ApiError, apiGet } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let me: { name: string; role?: string };
  try {
    me = await apiGet("/v1/me");
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 404)) redirect("/login?next=/admin");
    throw error;
  }
  if (me.role !== "ADMIN") redirect("/app");
  return <AdminShell name={me.name}>{children}</AdminShell>;
}
