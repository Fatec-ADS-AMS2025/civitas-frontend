"use client";

import type React from "react";
import { useMemo, useState } from "react";
import Form from "@/components/Form/form";
import Input from "@/components/Input";
import Modal from "@/components/modal";
import {
  INITIAL_SECRETARIA_TEXT_FILTERS,
  type Secretaria,
  type SecretariaRow,
  type SecretariaTextFilters,
} from "@/hooks/useSecretariaPage";
import { showToast } from "@/hooks/useToast";
import { novaSecretaria, secretariaFormFields } from "./secretariaConfig";

type SecretariaFiltersProps = {
  data: SecretariaRow[];
  filters: SecretariaTextFilters;
  setFilters: React.Dispatch<React.SetStateAction<SecretariaTextFilters>>;
  onCadastrar: (data: Omit<Secretaria, "idSecretaria">) => Promise<void>;
};

const VINCULO_OPTIONS = [
  { value: "comInstituicoes", label: "Com instituicoes" },
  { value: "semInstituicoes", label: "Sem instituicoes" },
];

const normalizeSearch = (value: unknown): string => {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const getOptionLabel = (options: Array<{ value: string | number; label: string }>, value: string): string => {
  return options.find((option) => String(option.value) === value)?.label ?? value;
};

const matchesFilters = (secretaria: SecretariaRow, filters: SecretariaTextFilters): boolean => {
  const query = normalizeSearch(filters.search);
  const cityQuery = normalizeSearch(filters.cidade);
  const searchTarget = normalizeSearch(
    [
      secretaria.nome,
      secretaria.descricao,
      secretaria.nomeRazaoSocial,
      secretaria.cnpj,
      secretaria.telefone,
      secretaria.email,
      secretaria.cidade,
      secretaria.estado,
      secretaria.situacaoLabel,
    ].join(" "),
  );

  if (query && !searchTarget.includes(query)) return false;
  if (cityQuery && !normalizeSearch(secretaria.cidade).includes(cityQuery)) return false;

  if (filters.vinculo === "comInstituicoes" && secretaria.totalInstituicoes <= 0) {
    return false;
  }

  if (filters.vinculo === "semInstituicoes" && secretaria.totalInstituicoes > 0) {
    return false;
  }

  return true;
};

export default function SecretariaFilters({ data, filters, setFilters, onCadastrar }: SecretariaFiltersProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const filteredRows = useMemo(() => data.filter((secretaria) => matchesFilters(secretaria, filters)), [data, filters]);

  const activeFilters = useMemo(() => {
    const active: Array<{ key: keyof SecretariaTextFilters; label: string; value: string }> = [];

    if (filters.search.trim()) {
      active.push({ key: "search", label: "Busca", value: filters.search.trim() });
    }

    if (filters.vinculo) {
      active.push({
        key: "vinculo",
        label: "Instituicoes",
        value: getOptionLabel(VINCULO_OPTIONS, filters.vinculo),
      });
    }

    if (filters.cidade.trim()) {
      active.push({ key: "cidade", label: "Cidade", value: filters.cidade.trim() });
    }

    return active;
  }, [filters]);

  const updateFilter = (field: keyof SecretariaTextFilters, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const clearFilters = () => {
    setFilters(INITIAL_SECRETARIA_TEXT_FILTERS);
  };

  return (
    <section className="civitas-surface civitas-enter mb-4 rounded-sm p-5">
      <div className="flex flex-col gap-4 border-b border-[var(--divider)] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
            <span className="material-symbols-outlined !text-[16px] text-[var(--secundary-1)]">manage_search</span>
            Filtro de secretarias
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[var(--secundary-1)]">
            Busque e refine sem abrir filtro avancado
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--foreground-muted)]">
            Pesquise por nome, descricao, CNPJ, telefone, cidade ou e-mail. Os resultados abaixo acompanham tambem o
            card de relacionamento selecionado.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-3 py-2 text-sm font-semibold text-[var(--foreground)]">
            {filteredRows.length} de {data.length} secretarias
          </span>
          <button type="button" onClick={() => setModalOpen(true)} className="civitas-action civitas-action--primary">
            <span className="material-symbols-outlined !text-[18px]">add</span>
            Cadastrar secretaria
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto]">
        <Input
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          label="Busca geral"
          placeholder="Nome, CNPJ, telefone, descricao ou e-mail"
        />

        <div className="space-y-2">
          <label
            htmlFor="secretaria-vinculo-filter"
            className="block text-sm font-semibold text-[var(--foreground-muted)]"
          >
            Instituicoes
          </label>
          <select
            id="secretaria-vinculo-filter"
            value={filters.vinculo}
            onChange={(event) => updateFilter("vinculo", event.target.value)}
            className="civitas-control"
          >
            <option value="">Todas</option>
            {VINCULO_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          value={filters.cidade}
          onChange={(event) => updateFilter("cidade", event.target.value)}
          label="Cidade"
          placeholder="Filtrar cidade"
        />

        <button type="button" onClick={clearFilters} className="civitas-action civitas-action--ghost self-end">
          <span className="material-symbols-outlined !text-[18px]">ink_eraser</span>
          Limpar
        </button>
      </div>

      <div className="mt-4 border-t border-[var(--divider)] pt-4">
        {activeFilters.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <span
                key={filter.key}
                className="inline-flex items-center gap-2 rounded-sm border border-[var(--border-default)] bg-[var(--surface-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]"
              >
                {filter.label}: {filter.value}
                <button
                  type="button"
                  onClick={() => updateFilter(filter.key, "")}
                  className="text-[var(--foreground-soft)] transition hover:text-[var(--tone-danger-text)]"
                  aria-label={`Remover filtro ${filter.label}`}
                >
                  <span className="material-symbols-outlined !text-[16px]">close</span>
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--foreground-soft)]">
            Nenhum filtro textual ativo. Use os cards acima para recortes rapidos por relacionamento.
          </p>
        )}
      </div>

      {modalOpen ? (
        <Modal setValue={() => setModalOpen(false)} value={modalOpen}>
          <Form
            object={novaSecretaria}
            name="secretaria"
            type="create"
            fields={secretariaFormFields}
            onCancel={() => setModalOpen(false)}
            onConfirm={async (formData) => {
              try {
                await onCadastrar(formData as Omit<Secretaria, "idSecretaria">);
                setModalOpen(false);
              } catch (error) {
                console.error("Erro ao cadastrar secretaria:", error);
                const message =
                  error instanceof Error ? error.message : "Erro ao cadastrar secretaria. Tente novamente.";
                showToast(message, "error");
              }
            }}
          />
        </Modal>
      ) : null}
    </section>
  );
}
