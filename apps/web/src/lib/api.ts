import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const origin = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;

  constructor(status: number) {
    super("api");
    this.status = status;
  }
}

export async function redirectAdminHome() {
  const me = await apiGet<{ role?: string }>("/v1/me");
  if (me.role === "ADMIN") redirect("/admin");
}

export async function apiGet<T>(path: string): Promise<T> {
  const jar = await cookies();
  const response = await fetch(`${origin}${path}`, {
    headers: { cookie: jar.toString() },
    cache: "no-store",
  });
  if (!response.ok) throw new ApiError(response.status);
  return (await response.json()) as T;
}
