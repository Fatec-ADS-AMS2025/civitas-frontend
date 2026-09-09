"use client";

import { useSecretariaPage } from "@/hooks/useSecretariaPage";
import { SecretariaPageContent } from "./_components";
import { secretariaSearchFields } from "./_components/secretariaConfig";

export default function SecretariaPage() {
  const secretariaPage = useSecretariaPage(secretariaSearchFields);

  return <SecretariaPageContent {...secretariaPage} />;
}
