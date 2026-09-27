import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/panel";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthPanel accent="¡Hola de nuevo!" title="შესვლა კაბინეტში">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthPanel>
  );
}
