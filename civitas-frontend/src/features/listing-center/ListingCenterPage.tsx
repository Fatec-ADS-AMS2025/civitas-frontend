"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import PaginationControls from "@/components/PaginationControls";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback-states";
import { useDashboardHeader } from "@/components/dashboard/dashboard-header";
import { showToast } from "@/hooks/useToast";
import { LISTING_CENTER_CONFIGS, LISTING_CENTER_REGISTRY } from "./registry";
import { useListingCenterStore } from "./store";
import type {
  ListingColumn,
  ListingConfig,
  ListingFilterDefinition,
  ListingPageResult,
  ListingRow,
} from "./types";
import {
  applyListingFilters,
  applyListingSort,
  buildFilterOptionsFromRows,
  exportListingRows,
  getInitialListingViewState,
  getVisibleColumns,
} from "./utils";

type ActiveFilterChip = {
  id: string;
  label: string;
  valueLabel: string;
};

const SORT_ICON_BY_DIRECTION = {
  asc: "north",
  desc: "south",
} as const;

const PAGE_SIZE_FALLBACK = [10, 20, 50];

const getActiveConfig = (activeListingId: string) =>
  LISTING_CENTER_REGISTRY[activeListingId] ?? LISTING_CENTER_CONFIGS[0];

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

export default function ListingCenterPage() {
  const {
    activeListingId,
    views,
    ensureView,
    resetView,
    setActiveListing,
    updateView,
  } = useListingCenterStore();

  const [result, setResult] = useState<ListingPageResult<ListingRow> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [showFilters, setShowFilters] = useState(true);
  const [showColumns, setShowColumns] = useState(false);

  const activeConfig = useMemo(() => getActiveConfig(activeListingId), [activeListingId]);
  const storedView = views[activeConfig.id];
  const fallbackView = useMemo(() => getInitialListingViewState(activeConfig), [activeConfig]);
  const viewState = storedView ?? fallbackView;
  const isServerPaginated = activeConfig.paginationMode === "server";
  const serverSearchSignature = isServerPaginated ? viewState.search : "";
  const serverFilterSignature = useMemo(
    () => (isServerPaginated ? JSON.stringify(viewState.filterValues) : ""),
    [isServerPaginated, viewState.filterValues],
  );
  const serverSortSignature = isServerPaginated
    ? `${viewState.sortColumnId ?? ""}:${viewState.sortDirection}`
    : "";

  useEffect(() => {
    ensureView(activeConfig.id);
  }, [activeConfig.id, ensureView]);

  const dashboardHeaderConfig = useMemo(
    () => ({
      title: "Central de Listagens",
      eyebrow: "Operacao",
      subtitle:
        "Um fluxo unico para alternar tabelas, salvar filtros temporarios e exportar a visualizacao atual.",
      breadcrumbs: [
        { label: "Home", href: "/dashboard" },
        { label: "Central de Listagens" },
      ],
      actions: [
        {
          label: "Atualizar",
          icon: "refresh",
          variant: "secondary" as const,
          onClick: () => setRefreshToken((currentValue) => currentValue + 1),
        },
        {
          label: "Resetar vista",
          icon: "restart_alt",
          variant: "ghost" as const,
          onClick: () => resetView(activeConfig.id),
        },
      ],
    }),
    [activeConfig.id, resetView],
  );

  useDashboardHeader(dashboardHeaderConfig);

  useEffect(() => {
    let isMounted = true;

    const loadRows = async () => {
      try {
        setIsLoading(true);
        const loadedResult = await activeConfig.loadPage({
          page: viewState.page,
          pageSize: viewState.pageSize,
          search: viewState.search,
          filterValues: viewState.filterValues,
          sortColumnId: viewState.sortColumnId,
          sortDirection: viewState.sortDirection,
        });

        if (!isMounted) {
          return;
        }

        setResult(loadedResult);
        setError(null);

        if (
          loadedResult.currentPage !== viewState.page ||
          loadedResult.pageSize !== viewState.pageSize
        ) {
          updateView(activeConfig.id, (currentView) => ({
            ...currentView,
            page: loadedResult.currentPage,
            pageSize: loadedResult.pageSize,
          }));
        }
      } catch (loadError) {
        console.error("Erro ao carregar central de listagens.", loadError);

        if (!isMounted) {
          return;
        }

        setResult(null);
        setError("Nao foi possivel carregar a listagem selecionada.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadRows();

    return () => {
      isMounted = false;
    };
  }, [
    activeConfig,
    refreshToken,
    serverFilterSignature,
    serverSearchSignature,
    serverSortSignature,
    updateView,
    viewState.page,
    viewState.pageSize,
  ]);

  const sourceRows = result?.allRows ?? result?.rows ?? [];
  const filteredRows = useMemo(
    () => applyListingFilters(sourceRows, activeConfig, viewState),
    [activeConfig, sourceRows, viewState],
  );
  const sortedRows = useMemo(
    () =>
      applyListingSort(
        filteredRows,
        activeConfig.columns,
        viewState.sortColumnId,
        viewState.sortDirection,
      ),
    [activeConfig.columns, filteredRows, viewState.sortColumnId, viewState.sortDirection],
  );
  const visibleColumns = useMemo(
    () => getVisibleColumns(activeConfig.columns, viewState.visibleColumnIds),
    [activeConfig.columns, viewState.visibleColumnIds],
  );
  const effectiveVisibleColumns =
    visibleColumns.length > 0 ? visibleColumns : activeConfig.columns;
  const usesServerRows = isServerPaginated && !result?.allRows;
  const totalFilteredPages =
    usesServerRows
      ? result?.totalPages ?? 0
      : sortedRows.length === 0
        ? 0
        : Math.ceil(sortedRows.length / viewState.pageSize);
  const resolvedPage =
    usesServerRows
      ? result?.currentPage ?? viewState.page
      : totalFilteredPages === 0
        ? 1
        : Math.min(viewState.page, totalFilteredPages);
  const paginatedRows = useMemo(() => {
    if (usesServerRows) {
      return sortedRows;
    }

    const start = (resolvedPage - 1) * viewState.pageSize;
    return sortedRows.slice(start, start + viewState.pageSize);
  }, [resolvedPage, sortedRows, usesServerRows, viewState.pageSize]);

  const selectOptionsByFilter = useMemo(() => {
    return activeConfig.filters.reduce<Record<string, { label: string; value: string }[]>>(
      (accumulator, filter) => {
        accumulator[filter.id] = buildSelectOptions(activeConfig, filter, sourceRows);
        return accumulator;
      },
      {},
    );
  }, [activeConfig, sourceRows]);

  const activeFilterChips = useMemo<ActiveFilterChip[]>(() => {
    return Object.entries(viewState.filterValues)
      .filter(([, value]) => value)
      .map(([filterId, value]) => {
        const definition = activeConfig.filters.find((item) => item.id === filterId);
        return {
          id: filterId,
          label: definition?.label ?? filterId,
          valueLabel: definition ? getValueLabel(definition, value) : value,
        };
      });
  }, [activeConfig.filters, viewState.filterValues]);

  const summaryText = usesServerRows
    ? `${sortedRows.length} registro(s) nesta pagina de ${result?.totalRecords ?? sourceRows.length}`
    : `${sortedRows.length} registro(s) visiveis de ${result?.totalRecords ?? sourceRows.length}`;

  useEffect(() => {
    if (resolvedPage === viewState.page) {
      return;
    }

    updateView(activeConfig.id, (currentView) => ({
      ...currentView,
      page: resolvedPage,
    }));
  }, [activeConfig.id, resolvedPage, updateView, viewState.page]);

  const onSearchChange = (value: string) => {
    startTransition(() => {
      updateView(activeConfig.id, (currentView) => ({
        ...currentView,
        search: value,
        page: 1,
      }));
    });
  };

  const onFilterChange = (filterId: string, nextValue: string) => {
    startTransition(() => {
      updateView(activeConfig.id, (currentView) => ({
        ...currentView,
        filterValues: {
          ...currentView.filterValues,
          [filterId]: nextValue,
        },
        page: 1,
      }));
    });
  };

  const onPresetSelect = (presetId: string) => {
    const preset = activeConfig.presets.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }

    updateView(activeConfig.id, (currentView) => ({
      ...currentView,
      selectedPresetId: preset.id,
      filterValues: { ...(preset.filterValues ?? {}) },
      page: 1,
    }));
  };

  const onColumnToggle = (columnId: string) => {
    updateView(activeConfig.id, (currentView) => {
      const nextVisible = currentView.visibleColumnIds.includes(columnId)
        ? currentView.visibleColumnIds.filter((item) => item !== columnId)
        : [...currentView.visibleColumnIds, columnId];

      return {
        ...currentView,
        visibleColumnIds:
          nextVisible.length > 0 ? nextVisible : currentView.visibleColumnIds,
      };
    });
  };

  const onSortChange = (columnId: string) => {
    updateView(activeConfig.id, (currentView) => {
      if (currentView.sortColumnId === columnId) {
        return {
          ...currentView,
          sortDirection: currentView.sortDirection === "asc" ? "desc" : "asc",
        };
      }

      return {
        ...currentView,
        sortColumnId: columnId,
        sortDirection: "asc",
      };
    });
  };

  const clearAllFilters = () => {
    updateView(activeConfig.id, (currentView) => ({
      ...currentView,
      selectedPresetId: undefined,
      search: "",
      filterValues: {},
      page: 1,
    }));
  };

  const handleExport = async (outputType: "xlsx" | "pdf") => {
    try {
      setIsExporting(true);
      await exportListingRows({
        config: activeConfig,
        columns: effectiveVisibleColumns,
        rows: sortedRows,
        outputType,
      });
      showToast("Arquivo gerado com sucesso.", "success");
    } catch (exportError) {
      console.error("Erro ao exportar central de listagens.", exportError);
      showToast("Nao foi possivel exportar esta visualizacao.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const pageSizeOptions = activeConfig.pageSizeOptions ?? PAGE_SIZE_FALLBACK;

  return (
    <div className="flex flex-col gap-5">
      <section className="civitas-surface civitas-enter p-4 sm:p-5 lg:p-6">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
              Registro centralizado
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--secundary-1)]">
              Escolha a listagem e modele a visualizacao
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((currentValue) => !currentValue)}
              className="civitas-action civitas-action--ghost rounded-sm"
            >
              <span className="material-symbols-outlined !text-[18px]">filter_alt</span>
              {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </button>
            <button
              type="button"
              onClick={() => setShowColumns((currentValue) => !currentValue)}
              className="civitas-action civitas-action--ghost rounded-sm"
            >
              <span className="material-symbols-outlined !text-[18px]">view_column</span>
              Colunas
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {LISTING_CENTER_CONFIGS.map((config) => {
            const isActive = config.id === activeConfig.id;

            return (
              <button
                key={config.id}
                type="button"
                onClick={() => setActiveListing(config.id)}
                className={`rounded-sm border p-4 text-left transition-all duration-[var(--motion-duration-fast)] ${
                  isActive
                    ? "border-[var(--primary-1)] bg-[var(--surface-subtle)] shadow-[var(--shadow-sm)]"
                    : "border-[var(--border-soft)] bg-[var(--surface-elevated)] hover:border-[var(--border-default)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-[var(--secundary-1)]">
                        {config.icon}
                      </span>
                      <span className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
                        {config.category}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                      {config.label}
                    </h3>
                  </div>
                  {isActive ? (
                    <span className="rounded-sm bg-[var(--primary-1)] px-2 py-1 text-xs font-semibold text-white">
                      Ativa
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
                  {config.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="civitas-surface civitas-enter overflow-hidden">
        <div className="border-b border-[var(--divider)] px-4 py-4 sm:px-5 lg:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                {activeConfig.category}
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-[var(--secundary-1)]">
                {activeConfig.label}
              </h3>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                {activeConfig.description}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] xl:min-w-[520px]">
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
                <span>Busca global</span>
                <input
                  value={viewState.search}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Busque por qualquer coluna visivel"
                  className="civitas-control min-h-[44px] rounded-sm px-4 py-2.5"
                />
              </label>

              <div className="flex flex-wrap items-end gap-2">
                <button
                  type="button"
                  onClick={() => void handleExport("xlsx")}
                  disabled={isExporting || sortedRows.length === 0}
                  className="civitas-action civitas-action--secondary min-h-[44px] rounded-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="material-symbols-outlined !text-[18px]">table_view</span>
                  {isExporting ? "Gerando..." : "Excel"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleExport("pdf")}
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
            {activeConfig.presets.map((preset) => {
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
              {activeConfig.filters.map((filter) => {
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
                onClick={clearAllFilters}
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
              {activeConfig.columns.map((column) => {
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
                ? `${activeConfig.columns.find((column) => column.id === viewState.sortColumnId)?.label ?? viewState.sortColumnId} (${viewState.sortDirection})`
                : "sem ordenacao"}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 sm:p-5 lg:p-6">
            <LoadingState title="Carregando listagem" rows={6} cols={Math.max(effectiveVisibleColumns.length, 4)} />
          </div>
        ) : error ? (
          <div className="p-4 sm:p-5 lg:p-6">
            <ErrorState description={error} onRetry={() => setRefreshToken((currentValue) => currentValue + 1)} />
          </div>
        ) : sortedRows.length === 0 ? (
          <div className="p-4 sm:p-5 lg:p-6">
            <EmptyState title={activeConfig.emptyTitle} description={activeConfig.emptyDescription} />
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto px-4 py-4 md:block sm:px-5 lg:px-6">
              <table className="min-w-full border-separate border-spacing-y-[10px]">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                    {effectiveVisibleColumns.map((column) => {
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
                      key={activeConfig.getRowId(row)}
                      className="rounded-sm bg-[var(--surface-elevated)] ring-1 ring-[var(--border-soft)]"
                    >
                      {effectiveVisibleColumns.map((column) => (
                        <td
                          key={`${activeConfig.getRowId(row)}-${column.id}`}
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
                  key={activeConfig.getRowId(row)}
                  className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4"
                >
                  <div className="space-y-3">
                    {effectiveVisibleColumns.map((column) => (
                      <div key={`${activeConfig.getRowId(row)}-${column.id}`} className="space-y-1">
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
            totalPages={totalFilteredPages}
            totalRecords={usesServerRows ? result?.totalRecords ?? sortedRows.length : sortedRows.length}
            pageSize={viewState.pageSize}
            pageSizeOptions={pageSizeOptions}
            disabled={isLoading}
            onPageChange={(page) =>
              updateView(activeConfig.id, (currentView) => ({
                ...currentView,
                page,
              }))
            }
            onPageSizeChange={(pageSize) =>
              updateView(activeConfig.id, (currentView) => ({
                ...currentView,
                page: 1,
                pageSize,
              }))
            }
          />
        ) : null}
      </section>
    </div>
  );
}
