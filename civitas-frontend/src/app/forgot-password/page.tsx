import type { Metadata } from "next";
import ForgotPasswordForm from "./_components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Esqueci minha senha | Civitas",
  description: "Solicitacao de recuperacao de senha do Civitas",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
