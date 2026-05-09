"use client";

import type {
  SecretariaCardFilter,
  SecretariaMetrics,
  SecretariaRow,
} from "@/hooks/useSecretariaPage";

type SecretariaRelationshipCardsProps = {
  secretarias: SecretariaRow[];
  metrics: SecretariaMetrics;
  selectedFilter: SecretariaCardFilter;
  onFilterChange: (filter: SecretariaCardFilter) => void;
};

type SummaryCardProps = {
  title: string;
  value: number;
  description: string;
  active?: boolean;
  onClick: () => void;
};

const isFilterActive = (
  selectedFilter: SecretariaCardFilter,
  candidate: SecretariaCardFilter
) => {
  if (selectedFilter.type !== candidate.type) return false;
  if (candidate.type === "secretaria" && selectedFilter.type === "secretaria") {
    return selectedFilter.idSecretaria === candidate.idSecretaria;
  }

  return true;
};

function SummaryCard({ title, value, description, active = false, onClick }: SummaryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`civitas-surface civitas-enter flex min-h-[124px] flex-col items-start justify-between rounded-sm border p-4 text-left transition hover:border-[var(--primary-1)] hover:bg-[var(--surface-subtle)] ${
        active
          ? "border-[var(--primary-1)] ring-4 ring-[var(--focus-ring)]"
          : "border-[var(--divider)]"
      }`}
    >
      <span className="text-sm font-semibold text-[var(--foreground-soft)]">{title}</span>
      <span className="text-3xl font-semibold text-[var(--foreground)]">{value}</span>
      <span className="text-xs text-[var(--foreground-soft)]">{description}</span>
    </button>
  );
}

export default function SecretariaRelationshipCards({
  secretarias,
  metrics,
  selectedFilter,
  onFilterChange,
}: SecretariaRelationshipCardsProps) {
  return (
    <section className="civitas-enter mb-4 flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Todas"
          value={metrics.totalSecretarias}
          description="Secretarias cadastradas"
          active={isFilterActive(selectedFilter, { type: "all" })}
          onClick={() => onFilterChange({ type: "all" })}
        />
        <SummaryCard
          title="Instituicoes cadastradas"
          value={metrics.totalInstituicoes}
          description="Total geral vinculado"
          onClick={() => onFilterChange({ type: "all" })}
        />
        <SummaryCard
          title="Com instituicoes"
          value={metrics.secretariasComInstituicoes}
          description="Secretarias com vinculos"
          active={isFilterActive(selectedFilter, { type: "withInstituicoes" })}
          onClick={() => onFilterChange({ type: "withInstituicoes" })}
        />
        <SummaryCard
          title="Sem instituicoes"
          value={metrics.secretariasSemInstituicoes}
          description="Secretarias sem vinculos"
          active={isFilterActive(selectedFilter, { type: "withoutInstituicoes" })}
          onClick={() => onFilterChange({ type: "withoutInstituicoes" })}
        />
      </div>

      {secretarias.length > 0 ? (
        <div className="civitas-surface rounded-sm border border-[var(--divider)] p-4">
          <div className="mb-3 flex flex-col gap-1">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Instituicoes por secretaria
            </h2>
            <p className="text-sm text-[var(--foreground-soft)]">
              Selecione uma secretaria para filtrar a listagem.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {secretarias.map((secretaria) => {
              const filter: SecretariaCardFilter = {
                type: "secretaria",
                idSecretaria: secretaria.idSecretaria,
              };

              return (
                <button
                  key={secretaria.idSecretaria}
                  type="button"
                  onClick={() => onFilterChange(filter)}
                  className={`rounded-sm border p-4 text-left transition hover:border-[var(--primary-1)] hover:bg-[var(--surface-subtle)] ${
                    isFilterActive(selectedFilter, filter)
                      ? "border-[var(--primary-1)] ring-4 ring-[var(--focus-ring)]"
                      : "border-[var(--divider)]"
                  }`}
                >
                  <span className="block truncate text-sm font-semibold text-[var(--foreground)]">
                    {secretaria.nome || secretaria.descricao || "Secretaria sem nome"}
                  </span>
                  <span className="mt-2 block text-2xl font-semibold text-[var(--foreground)]">
                    {secretaria.totalInstituicoes}
                  </span>
                  <span className="text-xs text-[var(--foreground-soft)]">
                    instituicoes vinculadas
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
