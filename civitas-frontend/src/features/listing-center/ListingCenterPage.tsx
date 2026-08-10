"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useDashboardHeader } from "@/components/dashboard/dashboard-header";
import { showToast } from "@/hooks/useToast";
import { ListingPanelView } from "./components/ListingPanelView";
import { ListingSelector } from "./components/ListingSelector";
import { LISTING_CENTER_CONFIGS, LISTING_CENTER_REGISTRY } from "./registry";
import { getListingPanelViewKey, useListingCenterStore } from "./store";
import type {
  ListingColumn,
  ListingConfig,
  ListingPageResult,
  ListingPanelId,
  ListingRow,
  ListingViewState,
} from "./types";
import {
  applyListingFilters,
  applyListingSort,
  exportListingComparison,
  exportListingRows,
  getInitialListingViewState,
  getVisibleColumns,
  loadListingRowsForExport,
} from "./utils";

const PAGE_SIZE_FALLBACK = [10, 20, 50];

const PANEL_LABEL: Record<ListingPanelId, string> = {
  primary: "Painel A",
  secondary: "Painel B",
};

const getActiveConfig = (listingId: string): ListingConfig<ListingRow> =>
  LISTING_CENTER_REGISTRY[listingId] ?? LISTING_CENTER_CONFIGS[0];

type ListingPanelModel = {
  panelId: ListingPanelId;
  listingId: string;
  config: ListingConfig<ListingRow>;
  viewState: ListingViewState;
  result: ListingPageResult<ListingRow> | null;
  sourceRows: ListingRow[];
  sortedRows: ListingRow[];
  paginatedRows: ListingRow[];
  visibleColumns: ListingColumn<ListingRow>[];
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;
  summaryText: string;
  totalPages: number;
  totalRecords: number;
  resolvedPage: number;
  pageSizeOptions: number[];
  setListing: (listingId: string) => void;
  resetView: () => void;
  retry: () => void;
  onSearchChange: (value: string) => void;
  onFilterChange: (filterId: string, nextValue: string) => void;
  onPresetSelect: (presetId: string) => void;
  onColumnToggle: (columnId: string) => void;
  onSortChange: (columnId: string) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  handleExport: (outputType: "xlsx" | "pdf") => Promise<void>;
};

function useListingPanelModel(panelId: ListingPanelId, refreshToken: number): ListingPanelModel {
  const { panelListingIds, views, resetPanelView, setPanelListing, updatePanelView } = useListingCenterStore();
  const [result, setResult] = useState<ListingPageResult<ListingRow> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localRefreshToken, setLocalRefreshToken] = useState(0);

  const listingId = panelListingIds[panelId] ?? LISTING_CENTER_CONFIGS[0]?.id;
  const config = useMemo(() => getActiveConfig(listingId), [listingId]);
  const viewKey = getListingPanelViewKey(panelId, config.id);
  const storedView = views[viewKey];
  const fallbackView = useMemo(() => getInitialListingViewState(config), [config]);
  const viewState = storedView ?? fallbackView;
  const pageSizeOptions = config.pageSizeOptions ?? PAGE_SIZE_FALLBACK;
  const serverSearchSignature = config.paginationMode === "server" ? viewState.search : "";
  const serverFilterSignature = useMemo(
    () => (config.paginationMode === "server" ? JSON.stringify(viewState.filterValues) : ""),
    [config.paginationMode, viewState.filterValues],
  );
  const serverSortSignature =
    config.paginationMode === "server" ? `${viewState.sortColumnId ?? ""}:${viewState.sortDirection}` : "";
  const serverPageSignature = config.paginationMode === "server" ? viewState.page : 1;

  useEffect(() => {
    let isMounted = true;

    const loadRows = async () => {
      try {
        setIsLoading(true);
        const loadedResult = await config.loadPage({
          page: viewState.page,
          pageSize: viewState.pageSize,
          search: viewState.search,
          filterValues: viewState.filterValues,
          sortColumnId: viewState.sortColumnId,
          sortDirection: viewState.sortDirection,
        });

        if (!isMounted) return;

        setResult(loadedResult);
        setError(null);
      } catch (loadError) {
        console.error("Erro ao carregar central de listagens.", loadError);

        if (!isMounted) return;

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
    config,
    localRefreshToken,
    panelId,
    refreshToken,
    serverFilterSignature,
    serverPageSignature,
    serverSearchSignature,
    serverSortSignature,
    viewState.pageSize,
  ]);

  const sourceRows = result?.allRows ?? result?.rows ?? [];
  const filteredRows = useMemo(
    () => applyListingFilters(sourceRows, config, viewState),
    [config, sourceRows, viewState],
  );
  const sortedRows = useMemo(
    () => applyListingSort(filteredRows, config.columns, viewState.sortColumnId, viewState.sortDirection),
    [config.columns, filteredRows, viewState.sortColumnId, viewState.sortDirection],
  );
  const visibleColumns = useMemo(() => {
    const columns = getVisibleColumns(config.columns, viewState.visibleColumnIds);
    return columns.length > 0 ? columns : config.columns;
  }, [config.columns, viewState.visibleColumnIds]);
  const usesServerRows = config.paginationMode === "server" && !result?.allRows;
  const totalPages = usesServerRows
    ? (result?.totalPages ?? 0)
    : sortedRows.length === 0
      ? 0
      : Math.ceil(sortedRows.length / viewState.pageSize);
  const resolvedPage = usesServerRows
    ? (result?.currentPage ?? viewState.page)
    : totalPages === 0
      ? 1
      : Math.min(viewState.page, totalPages);
  const paginatedRows = useMemo(() => {
    if (usesServerRows) return sortedRows;

    const start = (resolvedPage - 1) * viewState.pageSize;
    return sortedRows.slice(start, start + viewState.pageSize);
  }, [resolvedPage, sortedRows, usesServerRows, viewState.pageSize]);
  const totalRecords = usesServerRows ? (result?.totalRecords ?? sortedRows.length) : sortedRows.length;
  const summaryText = usesServerRows
    ? `${sortedRows.length} registro(s) nesta pagina de ${result?.totalRecords ?? sourceRows.length}`
    : `${sortedRows.length} registro(s) visiveis de ${sourceRows.length}`;

  const updateView = (updater: (currentView: ListingViewState) => ListingViewState) => {
    updatePanelView(panelId, config.id, updater);
  };

  const handleExport = async (outputType: "xlsx" | "pdf") => {
    try {
      setIsExporting(true);
      const exportRows = await loadListingRowsForExport(config, viewState);
      await exportListingRows({
        config,
        columns: visibleColumns,
        rows: exportRows,
        outputType,
        title: `${PANEL_LABEL[panelId]} - ${config.label}`,
        fileName: `${config.id}-${panelId}`,
      });
      showToast("Arquivo gerado com sucesso.", "success");
    } catch (exportError) {
      console.error("Erro ao exportar central de listagens.", exportError);
      showToast("Nao foi possivel exportar esta visualizacao.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    panelId,
    listingId: config.id,
    config,
    viewState,
    result,
    sourceRows,
    sortedRows,
    paginatedRows,
    visibleColumns,
    isLoading,
    isExporting,
    error,
    summaryText,
    totalPages,
    totalRecords,
    resolvedPage,
    pageSizeOptions,
    setListing: (nextListingId) => setPanelListing(panelId, nextListingId),
    resetView: () => resetPanelView(panelId, config.id),
    retry: () => setLocalRefreshToken((currentValue) => currentValue + 1),
    onSearchChange: (value) => {
      startTransition(() => {
        updateView((currentView) => ({
          ...currentView,
          search: value,
          page: 1,
        }));
      });
    },
    onFilterChange: (filterId, nextValue) => {
      startTransition(() => {
        updateView((currentView) => ({
          ...currentView,
          filterValues: {
            ...currentView.filterValues,
            [filterId]: nextValue,
          },
          page: 1,
        }));
      });
    },
    onPresetSelect: (presetId) => {
      const preset = config.presets.find((item) => item.id === presetId);
      if (!preset) return;

      updateView((currentView) => ({
        ...currentView,
        selectedPresetId: preset.id,
        filterValues: { ...(preset.filterValues ?? {}) },
        page: 1,
      }));
    },
    onColumnToggle: (columnId) => {
      updateView((currentView) => {
        const nextVisible = currentView.visibleColumnIds.includes(columnId)
          ? currentView.visibleColumnIds.filter((item) => item !== columnId)
          : [...currentView.visibleColumnIds, columnId];

        return {
          ...currentView,
          visibleColumnIds: nextVisible.length > 0 ? nextVisible : currentView.visibleColumnIds,
        };
      });
    },
    onSortChange: (columnId) => {
      updateView((currentView) => {
        if (currentView.sortColumnId === columnId) {
          return {
            ...currentView,
            sortDirection: currentView.sortDirection === "asc" ? "desc" : "asc",
            page: 1,
          };
        }

        return {
          ...currentView,
          sortColumnId: columnId,
          sortDirection: "asc",
          page: 1,
        };
      });
    },
    onClearFilters: () => {
      updateView((currentView) => ({
        ...currentView,
        selectedPresetId: undefined,
        search: "",
        filterValues: {},
        page: 1,
      }));
    },
    onPageChange: (page) => {
      updateView((currentView) => ({
        ...currentView,
        page,
      }));
    },
    onPageSizeChange: (pageSize) => {
      updateView((currentView) => ({
        ...currentView,
        page: 1,
        pageSize,
      }));
    },
    handleExport,
  };
}

export default function ListingCenterPage() {
  const { mode, setMode } = useListingCenterStore();
  const [refreshToken, setRefreshToken] = useState(0);
  const [showFilters, setShowFilters] = useState(true);
  const [isComparisonExporting, setIsComparisonExporting] = useState(false);
  const primaryPanel = useListingPanelModel("primary", refreshToken);
  const secondaryPanel = useListingPanelModel("secondary", refreshToken);
  const visiblePanels = mode === "compare" ? [primaryPanel, secondaryPanel] : [primaryPanel];

  const dashboardHeaderConfig = useMemo(
    () => ({
      title: "Central de Listagens",
      eyebrow: "Operacao",
      subtitle: "Hub reutilizavel para alternar, comparar, filtrar e exportar listagens dinamicas.",
      breadcrumbs: [{ label: "Home", href: "/dashboard" }, { label: "Central de Listagens" }],
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
          onClick: () => {
            primaryPanel.resetView();
            if (mode === "compare") {
              secondaryPanel.resetView();
            }
          },
        },
      ],
    }),
    [mode, primaryPanel.listingId, secondaryPanel.listingId],
  );

  useDashboardHeader(dashboardHeaderConfig);

  const exportComparison = async (outputType: "xlsx" | "pdf") => {
    try {
      setIsComparisonExporting(true);
      const panelsToExport = mode === "compare" ? [primaryPanel, secondaryPanel] : [primaryPanel];
      const sections = await Promise.all(
        panelsToExport.map(async (panel) => ({
          title: `${PANEL_LABEL[panel.panelId]} - ${panel.config.label}`,
          config: panel.config,
          columns: panel.visibleColumns,
          rows: await loadListingRowsForExport(panel.config, panel.viewState),
        })),
      );

      await exportListingComparison({
        outputType,
        title: mode === "compare" ? "Comparacao de Listagens" : "Central de Listagens",
        fileName: mode === "compare" ? "central-listagens-comparacao" : "central-listagens",
        sections,
      });
      showToast("Arquivo comparativo gerado com sucesso.", "success");
    } catch (exportError) {
      console.error("Erro ao exportar comparacao de listagens.", exportError);
      showToast("Nao foi possivel exportar a comparacao.", "error");
    } finally {
      setIsComparisonExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="civitas-surface civitas-enter p-4 sm:p-5 lg:p-6">
        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
              Registro centralizado
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--secundary-1)]">
              Escolha listagens e modele a visualizacao
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-1">
              <button
                type="button"
                onClick={() => setMode("single")}
                className={`rounded-sm px-3 py-2 text-sm font-semibold transition ${
                  mode === "single"
                    ? "bg-[var(--surface-subtle)] text-[var(--secundary-1)] shadow-[var(--shadow-xs)]"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Unica
              </button>
              <button
                type="button"
                onClick={() => setMode("compare")}
                className={`rounded-sm px-3 py-2 text-sm font-semibold transition ${
                  mode === "compare"
                    ? "bg-[var(--surface-subtle)] text-[var(--secundary-1)] shadow-[var(--shadow-xs)]"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Comparar
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((currentValue) => !currentValue)}
              className="civitas-action civitas-action--ghost shrink-0 whitespace-nowrap rounded-sm"
            >
              <span className="material-symbols-outlined !text-[18px]">filter_alt</span>
              {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </button>
            <button
              type="button"
              onClick={() => void exportComparison("xlsx")}
              disabled={isComparisonExporting}
              className="civitas-action civitas-action--secondary shrink-0 whitespace-nowrap rounded-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined !text-[18px]">table_view</span>
              {isComparisonExporting ? "Gerando..." : "Exportar visao Excel"}
            </button>
            <button
              type="button"
              onClick={() => void exportComparison("pdf")}
              disabled={isComparisonExporting}
              className="civitas-action civitas-action--primary shrink-0 whitespace-nowrap rounded-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined !text-[18px]">picture_as_pdf</span>
              {isComparisonExporting ? "Gerando..." : "Exportar visao PDF"}
            </button>
          </div>
        </div>

        {mode === "compare" ? (
          <div className="grid gap-4 2xl:grid-cols-2">
            {[primaryPanel, secondaryPanel].map((panel) => (
              <div key={panel.panelId} className="min-w-0">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                  {PANEL_LABEL[panel.panelId]}
                </p>
                <ListingSelector
                  configs={LISTING_CENTER_CONFIGS}
                  activeListingId={panel.listingId}
                  onSelect={panel.setListing}
                  compact
                />
              </div>
            ))}
          </div>
        ) : (
          <ListingSelector
            configs={LISTING_CENTER_CONFIGS}
            activeListingId={primaryPanel.listingId}
            onSelect={primaryPanel.setListing}
          />
        )}
      </section>

      <div className={mode === "compare" ? "grid min-w-0 gap-5 2xl:grid-cols-2" : "flex min-w-0 flex-col gap-5"}>
        {visiblePanels.map((panel) => (
          <ListingPanelView
            key={panel.panelId}
            panelId={panel.panelId}
            panelLabel={PANEL_LABEL[panel.panelId]}
            config={panel.config}
            viewState={panel.viewState}
            sourceRows={panel.sourceRows}
            sortedRows={panel.sortedRows}
            paginatedRows={panel.paginatedRows}
            visibleColumns={panel.visibleColumns}
            isLoading={panel.isLoading}
            isExporting={panel.isExporting}
            error={panel.error}
            showFilters={showFilters}
            summaryText={panel.summaryText}
            totalPages={panel.totalPages}
            totalRecords={panel.totalRecords}
            resolvedPage={panel.resolvedPage}
            pageSizeOptions={panel.pageSizeOptions}
            onSearchChange={panel.onSearchChange}
            onFilterChange={panel.onFilterChange}
            onPresetSelect={panel.onPresetSelect}
            onColumnToggle={panel.onColumnToggle}
            onSortChange={panel.onSortChange}
            onClearFilters={panel.onClearFilters}
            onPageChange={panel.onPageChange}
            onPageSizeChange={panel.onPageSizeChange}
            onRetry={panel.retry}
            onExport={(outputType) => void panel.handleExport(outputType)}
          />
        ))}
      </div>
    </div>
  );
}
