import { type Dispatch, type SetStateAction, useId, useMemo } from "react";
import Input from "@/components/Input";
import type { DespesasDashboardFilters } from "@/hooks/useDespesasDashboard";
import { FILTER_FIELD_CLASS_NAME, SOLICITA_UC_OPTIONS, VENCIMENTO_OPTIONS } from "../despesas.constants";
import type { SelectOption } from "../despesas.types";

type DespesasFiltrosProps = {
  filterForm: DespesasDashboardFilters;
  setFilterForm: Dispatch<SetStateAction<DespesasDashboardFilters>>;
  tipoCodigoOptions: SelectOption[];
  tipoDespesaOptions: SelectOption[];
  instituicaoOptions: SelectOption[];
  secretariaOptions: SelectOption[];
  filteredCount: number;
  totalCount: number;
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

type ActiveFilter = {
  key: keyof DespesasDashboardFilters;
  label: string;
  value: string;
};

function FilterSelect({ label, value, emptyLabel, options, onChange }: FilterSelectProps) {
  const selectId = useId();

  return (
    <div className="space-y-2">
      <label
        htmlFor={selectId}
        className="despesas-filter-label block text-sm font-semibold text-[var(--foreground-muted)]"
      >
        {label}
      </label>
      <select
        id={selectId}
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

function QuickFilterButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-sm border px-3.5 text-sm font-semibold transition ${
        active
          ? "border-[var(--secundary-1)] bg-[var(--secundary-1)] text-[var(--text-on-brand)]"
          : "border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--foreground)] hover:bg-[var(--surface-subtle)]"
      }`}
    >
      <span className="material-symbols-outlined !text-[18px]">{icon}</span>
      {label}
    </button>
  );
}

const getOptionLabel = (options: SelectOption[], value: string): string => {
  return options.find((option) => String(option.value) === value)?.label ?? value;
};

const formatDateLabel = (value: string): string => {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

const buildActiveFilters = (
  filterForm: DespesasDashboardFilters,
  options: {
    tipoCodigoOptions: SelectOption[];
    tipoDespesaOptions: SelectOption[];
    instituicaoOptions: SelectOption[];
    secretariaOptions: SelectOption[];
  },
): ActiveFilter[] => {
  const activeFilters: ActiveFilter[] = [];

  if (filterForm.search.trim()) {
    activeFilters.push({ key: "search", label: "Busca", value: filterForm.search.trim() });
  }

  if (filterForm.dataInicio) {
    activeFilters.push({
      key: "dataInicio",
      label: "Inicio",
      value: formatDateLabel(filterForm.dataInicio),
    });
  }

  if (filterForm.dataFim) {
    activeFilters.push({
      key: "dataFim",
      label: "Fim",
      value: formatDateLabel(filterForm.dataFim),
    });
  }

  if (filterForm.idSecretaria) {
    activeFilters.push({
      key: "idSecretaria",
      label: "Secretaria",
      value: getOptionLabel(options.secretariaOptions, filterForm.idSecretaria),
    });
  }

  if (filterForm.idInstituicao) {
    activeFilters.push({
      key: "idInstituicao",
      label: "Instituicao",
      value: getOptionLabel(options.instituicaoOptions, filterForm.idInstituicao),
    });
  }

  if (filterForm.idTipoCodigo) {
    activeFilters.push({
      key: "idTipoCodigo",
      label: "Tipo de codigo",
      value: getOptionLabel(options.tipoCodigoOptions, filterForm.idTipoCodigo),
    });
  }

  if (filterForm.idTipoDespesa) {
    activeFilters.push({
      key: "idTipoDespesa",
      label: "Categoria",
      value: getOptionLabel(options.tipoDespesaOptions, filterForm.idTipoDespesa),
    });
  }

  if (filterForm.vencimento) {
    activeFilters.push({
      key: "vencimento",
      label: "Vencimento",
      value: getOptionLabel(VENCIMENTO_OPTIONS, filterForm.vencimento),
    });
  }

  if (filterForm.solicitaUc) {
    activeFilters.push({
      key: "solicitaUc",
      label: "Solicita UC",
      value: getOptionLabel(SOLICITA_UC_OPTIONS, filterForm.solicitaUc),
    });
  }

  return activeFilters;
};

export default function DespesasFiltros({
  filterForm,
  setFilterForm,
  tipoCodigoOptions,
  tipoDespesaOptions,
  instituicaoOptions,
  secretariaOptions,
  filteredCount,
  totalCount,
  onApply,
  onClear,
  onRefresh,
}: DespesasFiltrosProps) {
  const activeFilters = useMemo(
    () =>
      buildActiveFilters(filterForm, {
        tipoCodigoOptions,
        tipoDespesaOptions,
        instituicaoOptions,
        secretariaOptions,
      }),
    [filterForm, instituicaoOptions, secretariaOptions, tipoCodigoOptions, tipoDespesaOptions],
  );

  const updateFilter = (field: keyof DespesasDashboardFilters, value: string) => {
    setFilterForm((currentValue) => ({ ...currentValue, [field]: value }));
  };

  const toggleFilter = (field: keyof DespesasDashboardFilters, value: string) => {
    setFilterForm((currentValue) => ({
      ...currentValue,
      [field]: currentValue[field] === value ? "" : value,
    }));
  };

  return (
    <section className="despesas-filter-panel civitas-surface civitas-enter rounded-sm p-5 sm:p-6">
      <div className="flex flex-col gap-3 border-b border-[var(--divider)] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
            <span className="material-symbols-outlined !text-[16px] text-[var(--secundary-1)]">tune</span>
            Filtros inteligentes
          </div>
          <h3 className="mt-3 text-[28px] font-bold text-[var(--secundary-1)]">
            Encontre a despesa sem tentativa e erro
          </h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--foreground-muted)]">
            Os filtros aplicam automaticamente e tambem podem ser confirmados no botao Aplicar. Use os atalhos para
            vencimento ou refine por secretaria, instituicao, periodo e categoria.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <span className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-3 py-2 text-sm font-semibold text-[var(--foreground)]">
            {filteredCount} de {totalCount} despesas
          </span>
          <button
            type="button"
            onClick={onRefresh}
            className="civitas-action civitas-action--ghost rounded-sm px-4 py-2.5 text-sm"
          >
            <span className="material-symbols-outlined !text-[18px]">refresh</span>
            Atualizar dados
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <QuickFilterButton
          active={filterForm.vencimento === "atrasadas"}
          label="Vencidas"
          icon="priority_high"
          onClick={() => toggleFilter("vencimento", "atrasadas")}
        />
        <QuickFilterButton
          active={filterForm.vencimento === "proximos7"}
          label="Proximos 7 dias"
          icon="event_upcoming"
          onClick={() => toggleFilter("vencimento", "proximos7")}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <div className="lg:col-span-2 xl:col-span-4">
          <Input
            value={filterForm.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            label="Busca geral"
            placeholder="Codigo, documento, descricao, instituicao, secretaria ou UC"
            className="despesas-filter-field"
          />
        </div>

        <FilterSelect
          label="Secretaria"
          value={filterForm.idSecretaria}
          emptyLabel="Todas as secretarias"
          options={secretariaOptions}
          onChange={(value) => updateFilter("idSecretaria", value)}
        />

        <FilterSelect
          label="Instituicao"
          value={filterForm.idInstituicao}
          emptyLabel="Todas as instituicoes"
          options={instituicaoOptions}
          onChange={(value) => updateFilter("idInstituicao", value)}
        />

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
          emptyLabel="Todos os tipos"
          options={tipoCodigoOptions}
          onChange={(value) => updateFilter("idTipoCodigo", value)}
        />
        <FilterSelect
          label="Categoria"
          value={filterForm.idTipoDespesa}
          emptyLabel="Todas as categorias"
          options={tipoDespesaOptions}
          onChange={(value) => updateFilter("idTipoDespesa", value)}
        />
        <FilterSelect
          label="Vencimento"
          value={filterForm.vencimento}
          emptyLabel="Qualquer vencimento"
          options={VENCIMENTO_OPTIONS}
          onChange={(value) => updateFilter("vencimento", value)}
        />
        <FilterSelect
          label="Solicita UC"
          value={filterForm.solicitaUc}
          emptyLabel="Todos"
          options={SOLICITA_UC_OPTIONS}
          onChange={(value) => updateFilter("solicitaUc", value)}
        />

        <div className="flex flex-col justify-end gap-3 sm:flex-row sm:items-end sm:justify-end xl:col-span-3">
          <button
            type="button"
            onClick={onApply}
            className="civitas-action civitas-action--primary rounded-sm px-5 py-3 text-sm"
          >
            <span className="material-symbols-outlined !text-[18px]">filter_alt</span>
            Aplicar agora
          </button>

          <button
            type="button"
            onClick={onClear}
            className="civitas-action civitas-action--ghost rounded-sm px-5 py-3 text-sm"
          >
            <span className="material-symbols-outlined !text-[18px]">ink_eraser</span>
            Limpar tudo
          </button>
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--divider)] pt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--foreground-muted)]">Filtros ativos</p>
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
            {activeFilters.length} ativo{activeFilters.length === 1 ? "" : "s"}
          </span>
        </div>

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
          <p className="rounded-sm border border-dashed border-[var(--border-default)] px-3 py-3 text-sm text-[var(--foreground-soft)]">
            Nenhum filtro ativo. A lista esta mostrando todos os registros carregados.
          </p>
        )}
      </div>
    </section>
  );
}
