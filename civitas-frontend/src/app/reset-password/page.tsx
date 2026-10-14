import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordForm from "./_components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Redefinir senha | Civitas",
  description: "Definicao de nova senha para acesso ao Civitas",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
