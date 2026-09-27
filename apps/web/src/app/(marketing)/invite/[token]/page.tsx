import { AuthPanel } from "@/components/auth/panel";
import { InviteForm } from "@/components/auth/invite-form";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <AuthPanel accent="¡Hola!" title="ანგარიშის გახსნა">
      <InviteForm token={token} />
    </AuthPanel>
  );
}
