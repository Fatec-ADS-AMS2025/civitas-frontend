"use client";

import { UsuariosContent } from "./_components/UsuariosContent";
import { useUsuariosPage } from "./_components/useUsuariosPage";

export default function Page() {
  const controller = useUsuariosPage();

  return <UsuariosContent {...controller} />;
}
