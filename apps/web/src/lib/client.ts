export type SendResult<T> = { ok: true; data: T } | { ok: false; message: string; status: number };

export async function send<T = unknown>(method: "POST" | "PATCH" | "PUT" | "DELETE", path: string, body?: unknown): Promise<SendResult<T>> {
  const response = await fetch(path, {
    method,
    credentials: "include",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).catch(() => null);
  if (!response) return { ok: false, message: "კავშირი ვერ დამყარდა.", status: 0 };
  const data = (await response.json().catch(() => null)) as (T & { error?: { messageKa?: string } }) | null;
  if (!response.ok) return { ok: false, message: data?.error?.messageKa ?? "ვერ შეინახა.", status: response.status };
  return { ok: true, data: data as T };
}

export async function load<T>(path: string): Promise<T | null> {
  const response = await fetch(path, { credentials: "include", cache: "no-store" }).catch(() => null);
  if (!response?.ok) return null;
  return (await response.json()) as T;
}

/** `datetime-local` value in Tbilisi time (UTC+4, no DST). */
export function toLocalInput(iso: string | null | undefined) {
  if (!iso) return "";
  const shifted = new Date(new Date(iso).getTime() + 4 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 16);
}

export function fromLocalInput(value: string) {
  if (!value) return null;
  return new Date(`${value}:00+04:00`).toISOString();
}
