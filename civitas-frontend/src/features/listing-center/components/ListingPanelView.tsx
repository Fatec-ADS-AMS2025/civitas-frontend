import PaginationControls from "@/components/PaginationControls";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback-states";
import type {
  ListingColumn,
  ListingConfig,
  ListingFilterDefinition,
  ListingRow,
  ListingViewState,
} from "../types";
import { buildFilterOptionsFromRows } from "../utils";

type ListingPanelViewProps = {
  panelLabel: string;
  config: ListingConfig<ListingRow>;
  viewState: ListingViewState;
  sourceRows: ListingRow[];
  sortedRows: ListingRow[];
  paginatedRows: ListingRow[];
  visibleColumns: ListingColumn<ListingRow>[];
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;
  showFilters: boolean;
  showColumns: boolean;
  summaryText: string;
  totalPages: number;
  totalRecords: number;
  resolvedPage: number;
  pageSizeOptions: number[];
  onSearchChange: (value: string) => void;
  onFilterChange: (filterId: string, nextValue: string) => void;
  onPresetSelect: (presetId: string) => void;
  onColumnToggle: (columnId: string) => void;
  onSortChange: (columnId: string) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRetry: () => void;
  onExport: (outputType: "xlsx" | "pdf") => void;
};

const SORT_ICON_BY_DIRECTION = {
  asc: "north",
  desc: "south",
} as const;

const getValueLabel = (definition: ListingFilterDefinition, value: string) => {
  if (definition.type === "number-range" || definition.type === "date-range") {
    const [from = "", to = ""] = value.split("|");
    if (from && to) return `${from} ate ${to}`;
    if (from) return `a partir de ${from}`;
    if (to) return `ate ${to}`;
  }

  const option = definition.options?.find((item) => item.value === value);
  return option?.label ?? value;
};

const getCellAlignmentClassName = (align?: ListingColumn<ListingRow>["align"]) => {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
};

const renderColumnValue = (column: ListingColumn<ListingRow>, row: ListingRow) => {
  const value = column.accessor(row);

  if (column.render) {
    return column.render(value, row);
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
};

const buildSelectOptions = (
  config: ListingConfig<ListingRow>,
  filter: ListingFilterDefinition,
  rows: ListingRow[],
) => {
  if (filter.options && filter.options.length > 0) {
    return filter.options;
  }

  const column = config.columns.find((item) => item.id === filter.id);
  if (!column) {
    return [];
  }

  return buildFilterOptionsFromRows(rows, column);
};

export function ListingPanelView({
  panelLabel,
  config,
  viewState,
  sourceRows,
  sortedRows,
  paginatedRows,
  visibleColumns,
  isLoading,
  isExporting,
  error,
  showFilters,
  showColumns,
  summaryText,
  totalPages,
  totalRecords,
  resolvedPage,
  pageSizeOptions,
  onSearchChange,
  onFilterChange,
  onPresetSelect,
  onColumnToggle,
  onSortChange,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onExport,
}: ListingPanelViewProps) {
  const selectOptionsByFilter = config.filters.reduce<Record<string, { label: string; value: string }[]>>(
    (accumulator, filter) => {
      accumulator[filter.id] = buildSelectOptions(config, filter, sourceRows);
      return accumulator;
    },
    {},
  );
  const activeFilterChips = Object.entries(viewState.filterValues)
    .filter(([, value]) => value)
    .map(([filterId, value]) => {
      const definition = config.filters.find((item) => item.id === filterId);
      return {
        id: filterId,
        label: definition?.label ?? filterId,
        valueLabel: definition ? getValueLabel(definition, value) : value,
      };
    });

  return (
    <section className="civitas-surface civitas-enter min-w-0 overflow-hidden">
      <div className="border-b border-[var(--divider)] px-4 py-4 sm:px-5 lg:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
              {panelLabel} / {config.category}
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-[var(--secundary-1)]">
              {config.label}
            </h3>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              {config.description}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] xl:min-w-[520px]">
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
              <span>Busca global</span>
              <input
                value={viewState.search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Busque por qualquer coluna"
                className="civitas-control min-h-[44px] rounded-sm px-4 py-2.5"
              />
            </label>

            <div className="flex flex-wrap items-end gap-2">
              <button
                type="button"
                onClick={() => onExport("xlsx")}
                disabled={isExporting || sortedRows.length === 0}
                className="civitas-action civitas-action--secondary min-h-[44px] rounded-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="material-symbols-outlined !text-[18px]">table_view</span>
                {isExporting ? "Gerando..." : "Excel"}
              </button>
              <button
                type="button"
                onClick={() => onExport("pdf")}
                disabled={isExporting || sortedRows.length === 0}
                className="civitas-action civitas-action--primary min-h-[44px] rounded-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="material-symbols-outlined !text-[18px]">picture_as_pdf</span>
                {isExporting ? "Gerando..." : "PDF"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {config.presets.map((preset) => {
            const isSelected = viewState.selectedPresetId === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onPresetSelect(preset.id)}
                className={`rounded-sm border px-3 py-2 text-sm font-medium transition-all duration-[var(--motion-duration-fast)] ${
                  isSelected
                    ? "border-[var(--primary-1)] bg-[var(--surface-subtle)] text-[var(--primary-1)]"
                    : "border-[var(--border-soft)] bg-[var(--surface-elevated)] text-[var(--foreground)] hover:border-[var(--border-default)]"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {showFilters ? (
        <div className="border-b border-[var(--divider)] bg-[var(--surface-subtle)] px-4 py-4 sm:px-5 lg:px-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {config.filters.map((filter) => {
              const value = viewState.filterValues[filter.id] ?? "";
              const options = selectOptionsByFilter[filter.id] ?? [];

              if (filter.type === "select") {
                return (
                  <label key={filter.id} className="flex flex-col gap-2 text-sm font-medium">
                    <span>{filter.label}</span>
                    <select
                      value={value}
                      onChange={(event) => onFilterChange(filter.id, event.target.value)}
                      className="civitas-control min-h-[44px] rounded-sm px-4 py-2.5"
                    >
                      <option value="">Todos</option>
                      {options.map((option) => (
                        <option key={`${filter.id}-${option.value}`} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              }

              if (filter.type === "number-range" || filter.type === "date-range") {
                const [from = "", to = ""] = value.split("|");
                const inputType = filter.type === "date-range" ? "date" : "number";

                return (
                  <div key={filter.id} className="flex flex-col gap-2 text-sm font-medium">
                    <span>{filter.label}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type={inputType}
                        value={from}
                        onChange={(event) =>
                          onFilterChange(filter.id, `${event.target.value}|${to}`)
                        }
                        placeholder="De"
                        className="civitas-control min-h-[44px] rounded-sm px-4 py-2.5"
                      />
                      <input
                        type={inputType}
                        value={to}
                        onChange={(event) =>
                          onFilterChange(filter.id, `${from}|${event.target.value}`)
                        }
                        placeholder="Ate"
                        className="civitas-control min-h-[44px] rounded-sm px-4 py-2.5"
                      />
                    </div>
                  </div>
                );
              }

              return (
                <label key={filter.id} className="flex flex-col gap-2 text-sm font-medium">
                  <span>{filter.label}</span>
                  <input
                    value={value}
                    onChange={(event) => onFilterChange(filter.id, event.target.value)}
                    placeholder={`Filtrar por ${filter.label.toLowerCase()}`}
                    className="civitas-control min-h-[44px] rounded-sm px-4 py-2.5"
                  />
                </label>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onClearFilters}
              className="civitas-action civitas-action--ghost rounded-sm"
            >
              <span className="material-symbols-outlined !text-[18px]">ink_eraser</span>
              Limpar filtros
            </button>
            <span className="text-sm text-[var(--foreground-muted)]">
              Estado salvo temporariamente durante a navegacao.
            </span>
          </div>

          {activeFilterChips.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => onFilterChange(chip.id, "")}
                  className="inline-flex items-center gap-2 rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--foreground)]"
                >
                  <span className="font-semibold">{chip.label}:</span>
                  <span>{chip.valueLabel}</span>
                  <span className="material-symbols-outlined !text-[16px]">close</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {showColumns ? (
        <div className="border-b border-[var(--divider)] px-4 py-4 sm:px-5 lg:px-6">
          <div className="flex flex-wrap gap-2">
            {config.columns.map((column) => {
              const checked = viewState.visibleColumnIds.includes(column.id);
              return (
                <label
                  key={column.id}
                  className="inline-flex items-center gap-2 rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onColumnToggle(column.id)}
                  />
                  {column.label}
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="border-b border-[var(--divider)] px-4 py-3 text-sm text-[var(--foreground-muted)] sm:px-5 lg:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>{summaryText}</span>
          <span>
            Ordenacao atual:{" "}
            {viewState.sortColumnId
              ? `${config.columns.find((column) => column.id === viewState.sortColumnId)?.label ?? viewState.sortColumnId} (${viewState.sortDirection})`
              : "sem ordenacao"}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 sm:p-5 lg:p-6">
          <LoadingState title="Carregando listagem" rows={6} cols={Math.max(visibleColumns.length, 4)} />
        </div>
      ) : error ? (
        <div className="p-4 sm:p-5 lg:p-6">
          <ErrorState description={error} onRetry={onRetry} />
        </div>
      ) : sortedRows.length === 0 ? (
        <div className="p-4 sm:p-5 lg:p-6">
          <EmptyState title={config.emptyTitle} description={config.emptyDescription} />
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto px-4 py-4 md:block sm:px-5 lg:px-6">
            <table className="min-w-full border-separate border-spacing-y-[10px]">
              <thead>
                <tr className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                  {visibleColumns.map((column) => {
                    const isActiveSort = viewState.sortColumnId === column.id;
                    return (
                      <th key={column.id} className={`px-4 py-2 ${getCellAlignmentClassName(column.align)}`}>
                        <button
                          type="button"
                          onClick={() => onSortChange(column.id)}
                          className={`inline-flex items-center gap-2 font-semibold ${
                            column.align === "right" ? "ml-auto" : ""
                          }`}
                        >
                          {column.label}
                          <span className="material-symbols-outlined !text-[16px]">
                            {isActiveSort ? SORT_ICON_BY_DIRECTION[viewState.sortDirection] : "unfold_more"}
                          </span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row) => (
                  <tr
                    key={config.getRowId(row)}
                    className="rounded-sm bg-[var(--surface-elevated)] ring-1 ring-[var(--border-soft)]"
                  >
                    {visibleColumns.map((column) => (
                      <td
                        key={`${config.getRowId(row)}-${column.id}`}
                        className={`px-4 py-4 align-top text-sm text-[var(--foreground)] ${getCellAlignmentClassName(column.align)}`}
                      >
                        {renderColumnValue(column, row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 p-4 md:hidden">
            {paginatedRows.map((row) => (
              <article
                key={config.getRowId(row)}
                className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4"
              >
                <div className="space-y-3">
                  {visibleColumns.map((column) => (
                    <div key={`${config.getRowId(row)}-${column.id}`} className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                        {column.label}
                      </p>
                      <div className={`text-sm text-[var(--foreground)] ${getCellAlignmentClassName(column.align)}`}>
                        {renderColumnValue(column, row)}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {!isLoading && !error ? (
        <PaginationControls
          currentPage={resolvedPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={viewState.pageSize}
          pageSizeOptions={pageSizeOptions}
          disabled={isLoading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      ) : null}
    </section>
  );
}
