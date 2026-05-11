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
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {instituicoes.map((instituicao) => (
            <article
              key={instituicao.id}
              className="rounded-sm border border-[var(--divider)] bg-[var(--surface-subtle)] p-4"
            >
              <div className="mb-3 flex flex-col gap-1">
                <h4 className="text-sm font-semibold text-[var(--foreground)]">
                  {instituicao.nome || "Instituicao sem nome"}
                </h4>
                <span className="text-xs text-[var(--foreground-soft)]">
                  {getSituacaoLabel(instituicao.situacao)}
                </span>
              </div>

              <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
                    CNPJ
                  </dt>
                  <dd className="break-words text-[var(--foreground)]">
                    {instituicao.cnpj || "Nao informado"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
                    Localidade
                  </dt>
                  <dd className="break-words text-[var(--foreground)]">
                    {getInstituicaoLocalidade(instituicao)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
                    Telefone
                  </dt>
                  <dd className="break-words text-[var(--foreground)]">
                    {instituicao.telefone || "Nao informado"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
                    E-mail
                  </dt>
                  <dd className="break-words text-[var(--foreground)]">
                    {instituicao.email || "Nao informado"}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
