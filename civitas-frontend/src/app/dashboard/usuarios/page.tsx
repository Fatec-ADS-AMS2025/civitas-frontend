"use client";

import { useUsuariosPage } from "./_components/useUsuariosPage";

import { UsuariosContent } from "./_components/UsuariosContent";

export default function Page() {

  const controller =
    useUsuariosPage();

  return (
    <UsuariosContent
      {...controller}
    />
  );
}