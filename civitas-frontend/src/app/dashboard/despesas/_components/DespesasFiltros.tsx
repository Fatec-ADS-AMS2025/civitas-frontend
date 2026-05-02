import type { Dispatch, SetStateAction } from "react";
import Input from "@/components/Input";
import type { DespesasDashboardFilters } from "@/hooks/useDespesasDashboard";
import {
  FILTER_FIELD_CLASS_NAME,
  SOLICITA_UC_OPTIONS,
  STATUS_OPTIONS,
} from "../despesas.constants";
import type { SelectOption } from "../despesas.types";

type DespesasFiltrosProps = {
  filterForm: DespesasDashboardFilters;
  setFilterForm: Dispatch<SetStateAction<DespesasDashboardFilters>>;
  tipoCodigoOptions: SelectOption[];
  tipoDespesaOptions: SelectOption[];
  onApply: () => void;
  onClear: () => void;
  onRefresh: () => void;
};

type FilterSelectProps = {
  label: string;
  value: string | number;
  emptyLabel: string;
  options: SelectOption[];
  onChange: (value: string) => void;
};

function FilterSelect({
  label,
  value,
  emptyLabel,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <div className="space-y-2">
      <label className="despesas-filter-label block text-sm font-semibold text-[var(--foreground-muted)]">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={FILTER_FIELD_CLASS_NAME}
      >
        <option value="">{emptyLabel}</option>
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function DespesasFiltros({
  filterForm,
  setFilterForm,
  tipoCodigoOptions,
  tipoDespesaOptions,
  onApply,
  onClear,
  onRefresh,
}: DespesasFiltrosProps) {
  const updateFilter = (field: keyof DespesasDashboardFilters, value: string) => {
    setFilterForm((currentValue) => ({ ...currentValue, [field]: value }));
  };

  return (
    <section className="despesas-filter-panel civitas-surface civitas-enter rounded-sm p-5 sm:p-6">
      <div className="flex flex-col gap-3 border-b border-[var(--divider)] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
            <span className="material-symbols-outlined !text-[16px] text-[var(--secundary-1)]">
              tune
            </span>
            Filtros
          </div>
          <h3 className="mt-3 text-[28px] font-bold text-[var(--secundary-1)]">
            Refina visao de despesas
          </h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--foreground-muted)]">
            Combine periodo, categoria, status e busca textual para encontrar
            rapidamente os registros que importam. A listagem responde em tempo real
            aos dados do backend.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="civitas-action civitas-action--ghost rounded-sm px-4 py-2.5 text-sm"
        >
          <span className="material-symbols-outlined !text-[18px]">refresh</span>
          Atualizar dados
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <Input
            value={filterForm.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Busque por codigo, documento, descricao, instituicao ou secretaria"
            className="despesas-filter-field"
          />
        </div>

        <Input
          type="date"
          value={filterForm.dataInicio}
          onChange={(event) => updateFilter("dataInicio", event.target.value)}
          label="Inicio do periodo"
          className="despesas-filter-field"
        />

        <Input
          type="date"
          value={filterForm.dataFim}
          onChange={(event) => updateFilter("dataFim", event.target.value)}
          label="Fim do periodo"
          className="despesas-filter-field"
        />

        <FilterSelect
          label="Tipo de codigo"
          value={filterForm.idTipoCodigo}
          emptyLabel="Todos"
          options={tipoCodigoOptions}
          onChange={(value) => updateFilter("idTipoCodigo", value)}
        />
        <FilterSelect
          label="Categoria"
          value={filterForm.idTipoDespesa}
          emptyLabel="Todas"
          options={tipoDespesaOptions}
          onChange={(value) => updateFilter("idTipoDespesa", value)}
        />
        <FilterSelect
          label="Status"
          value={filterForm.situacao}
          emptyLabel="Todas"
          options={STATUS_OPTIONS}
          onChange={(value) => updateFilter("situacao", value)}
        />
        <FilterSelect
          label="Solicita UC"
          value={filterForm.solicitaUc}
          emptyLabel="Todos"
          options={SOLICITA_UC_OPTIONS}
          onChange={(value) => updateFilter("solicitaUc", value)}
        />

        <div className="flex flex-col justify-end gap-3 sm:flex-row sm:items-end sm:justify-end">
          <button
            type="button"
            onClick={onApply}
            className="civitas-action civitas-action--primary rounded-sm px-5 py-3 text-sm"
          >
            <span className="material-symbols-outlined !text-[18px]">filter_alt</span>
            Aplicar filtros
          </button>

          <button
            type="button"
            onClick={onClear}
            className="civitas-action civitas-action--ghost rounded-sm px-5 py-3 text-sm"
          >
            <span className="material-symbols-outlined !text-[18px]">ink_eraser</span>
            Limpar painel
          </button>
        </div>
      </div>
    </section>
  );
}
