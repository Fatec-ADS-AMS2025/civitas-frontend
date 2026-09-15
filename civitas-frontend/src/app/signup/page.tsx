import type { Metadata } from "next";
import SignupForm from "./_components/SignupForm";

export const metadata: Metadata = {
  title: "Criar conta | Civitas",
  description: "Cadastro de novos usuarios do Civitas",
};

export default function SignupPage() {
  return <SignupForm />;
}
