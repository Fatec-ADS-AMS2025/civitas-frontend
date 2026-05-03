"use client";

import { SecretariaPageContent } from "./_components";
import { useSecretariaPage } from "@/hooks/useSecretariaPage";
import { secretariaSearchFields } from "./_components/secretariaConfig";

export default function SecretariaPage() {
  const secretariaPage = useSecretariaPage(secretariaSearchFields);

  return <SecretariaPageContent {...secretariaPage} />;
}
