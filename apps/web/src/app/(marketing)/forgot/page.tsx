import { Suspense } from "react";
import { ForgotForm } from "@/components/auth/forgot-form";
import { AuthPanel } from "@/components/auth/panel";

export default function ForgotPage() {
  return (
    <AuthPanel accent="¡Hola!" title="პაროლის აღდგენა">
      <Suspense>
        <ForgotForm />
      </Suspense>
    </AuthPanel>
  );
}
