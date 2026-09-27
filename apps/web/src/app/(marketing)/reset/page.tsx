import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/panel";
import { ResetForm } from "@/components/auth/reset-form";

export default function ResetPage() {
  return (
    <AuthPanel accent="¡Hola!" title="ახალი პაროლი">
      <Suspense>
        <ResetForm />
      </Suspense>
    </AuthPanel>
  );
}
