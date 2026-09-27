"use client";

import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await fetch("/v1/auth/sign-out", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button type="button" className="text-sm font-semibold text-teal-deep" onClick={signOut}>
      გასვლა
    </button>
  );
}
