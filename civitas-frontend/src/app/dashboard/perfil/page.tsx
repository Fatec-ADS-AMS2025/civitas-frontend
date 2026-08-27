"use client";

import { useEffect, useMemo, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { usuarioService } from "@/hooks/usuario";
import type UsuarioDTO from "@/models/usuario";

const formatTipoUsuario = (tipoUsuario: UsuarioDTO["tipoUsuario"] | string | undefined) => {
  if (tipoUsuario === undefined || tipoUsuario === null || tipoUsuario === "") {
    return "Nao informado";
  }

  return String(tipoUsuario);
};

const ProfileSkeleton = () => (
  <section className="civitas-surface civitas-enter p-5 sm:p-6">
    <div className="skeleton-loader space-y-5">
      <div className="flex items-center gap-4">
        <div className="skeleton-line h-14 w-14 rounded-sm" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="skeleton-line h-5 w-48 rounded-sm" />
          <div className="skeleton-line h-4 w-64 max-w-full rounded-sm" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="skeleton-line h-20 rounded-sm" />
        <div className="skeleton-line h-20 rounded-sm" />
        <div className="skeleton-line h-20 rounded-sm" />
      </div>
    </div>
  </section>
);

const ProfileField = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4">
    <dt className="text-xs font-semibold uppercase tracking-normal text-[var(--foreground-soft)]">{label}</dt>
    <dd className="mt-2 break-words text-sm font-semibold text-[var(--foreground)] sm:text-base">
      {value || "Nao informado"}
    </dd>
  </div>
);

export default function PerfilPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UsuarioDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        setError("Nao foi possivel identificar o usuario autenticado.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await usuarioService.getByIdData(user.id);

        if (!isMounted) return;

        if (!data) {
          setError("Dados do usuario nao encontrados.");
          setProfile(null);
          return;
        }

        setProfile(data);
      } catch (profileError) {
        console.error("Erro ao carregar perfil do usuario:", profileError);

        if (isMounted) {
          setError("Nao foi possivel carregar os dados do perfil.");
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const displayUser = useMemo(
    () => ({
      nome: profile?.nome ?? user?.nome ?? "",
      email: profile?.email ?? user?.email ?? "",
      tipoUsuario: formatTipoUsuario(profile?.tipoUsuario ?? user?.tipoUsuario),
    }),
    [profile, user?.email, user?.nome, user?.tipoUsuario],
  );

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <section className="civitas-surface civitas-enter p-5 sm:p-6">
        <div className="civitas-error-banner px-4 py-3 text-sm">{error}</div>
      </section>
    );
  }

  return (
    <section className="civitas-surface civitas-enter p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-[var(--border-soft)] pb-5 sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm bg-[var(--sidebar-profile-bg)] text-[var(--sidebar-profile-text)]">
          <span className="material-symbols-outlined text-[30px]">person</span>
        </div>
        <div className="min-w-0">
          <h2 className="break-words text-xl font-semibold text-[var(--secundary-1)]">
            {displayUser.nome || "Usuario"}
          </h2>
          <p className="mt-1 break-words text-sm text-[var(--foreground-muted)]">
            {displayUser.email || "E-mail nao informado"}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid gap-4 md:grid-cols-3">
        <ProfileField label="Nome" value={displayUser.nome} />
        <ProfileField label="E-mail" value={displayUser.email} />
        <ProfileField label="Perfil/Permissao" value={displayUser.tipoUsuario} />
      </dl>
    </section>
  );
}
