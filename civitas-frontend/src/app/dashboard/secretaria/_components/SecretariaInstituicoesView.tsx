"use client";

import { getSituacaoLabel } from "@/global/situacao";
import type { SecretariaRow } from "@/hooks/useSecretariaPage";
import type InstituicaoDTO from "@/models/instituicao";

type SecretariaInstituicoesViewProps = {
  secretaria: SecretariaRow;
};

const getInstituicaoLocalidade = (instituicao: InstituicaoDTO): string => {
  const cidade = instituicao.cidade?.trim();
  const estado = instituicao.estado?.trim();

  if (cidade && estado) return `${cidade}/${estado}`;
  if (cidade) return cidade;
  if (estado) return estado;
  return "Localidade nao informada";
};

export default function SecretariaInstituicoesView({
  secretaria,
}: SecretariaInstituicoesViewProps) {
  const instituicoes = secretaria.instituicoesRelacionadas;

  return (
    <section className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4 md:p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-[var(--foreground)]">
            Instituicoes vinculadas
          </h3>
          <p className="text-sm text-[var(--foreground-soft)]">
            {instituicoes.length} instituicao{instituicoes.length === 1 ? "" : "es"} nesta
            secretaria
          </p>
        </div>
      </div>

      {instituicoes.length === 0 ? (
        <div className="rounded-sm border border-dashed border-[var(--divider)] px-4 py-5 text-sm text-[var(--foreground-soft)]">
          Nenhuma instituicao vinculada a esta secretaria.
        </div>
      ) : (
        <ul className="divide-y divide-[var(--divider)] overflow-hidden rounded-sm border border-[var(--divider)] bg-[var(--surface-subtle)]">
          {instituicoes.map((instituicao, index) => (
            <li
              key={instituicao.id}
              className="grid gap-4 px-4 py-4 md:grid-cols-[auto_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] md:items-center"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] text-sm font-semibold text-[var(--secundary-1)]">
                {index + 1}
              </span>

              <div className="min-w-0">
                <h4 className="truncate text-sm font-semibold text-[var(--foreground)]">
                  {instituicao.nome || "Instituicao sem nome"}
                </h4>
                <p className="mt-1 text-xs text-[var(--foreground-soft)]">
                  {getSituacaoLabel(instituicao.situacao)} | CNPJ:{" "}
                  {instituicao.cnpj || "Nao informado"}
                </p>
              </div>

              <div className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
                  Localidade
                </span>
                <span className="mt-1 block truncate text-sm text-[var(--foreground)]">
                  {getInstituicaoLocalidade(instituicao)}
                </span>
              </div>

              <div className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
                  Contato
                </span>
                <span className="mt-1 block truncate text-sm text-[var(--foreground)]">
                  {instituicao.telefone || "Telefone nao informado"}
                </span>
                <span className="mt-0.5 block truncate text-xs text-[var(--foreground-soft)]">
                  {instituicao.email || "E-mail nao informado"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
