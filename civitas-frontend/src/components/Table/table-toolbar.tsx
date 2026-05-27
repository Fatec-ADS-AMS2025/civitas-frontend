import type { TableDisplayMode } from "./table-types";
import type { TableSortState } from "./use-table-sort";

type TableToolbarProps = {
  visibleColumns: number;
  totalColumns: number;
  viewMode: TableDisplayMode;
  hasCardView: boolean;
  sortState: TableSortState | null;
  onViewModeChange: (mode: TableDisplayMode) => void;
  onClearSort: () => void;
};

const viewModes: Array<{ id: TableDisplayMode; label: string; icon: string }> = [
  { id: "table", label: "Tabela", icon: "table_rows" },
  { id: "cards", label: "Cards", icon: "dashboard" },
];

export function TableToolbar({
  visibleColumns,
  totalColumns,
  viewMode,
  hasCardView,
  sortState,
  onViewModeChange,
  onClearSort,
}: TableToolbarProps) {
  const title = viewMode === "cards" ? "Cards" : "Tabela";
  const subtitle =
    viewMode === "cards"
      ? "Visualizacao alternativa dos registros"
      : `${visibleColumns} de ${totalColumns} colunas visiveis`;

  return (
    <div className="flex flex-col gap-4 border-b border-[var(--divider)] px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between lg:px-6">
      <div>
        <h2 className="text-sm font-semibold text-[var(--foreground)]">{title}</h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
          {subtitle}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        {hasCardView ? (
          <div className="inline-flex rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] p-1">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                aria-pressed={viewMode === mode.id}
                onClick={() => onViewModeChange(mode.id)}
                className={`flex min-h-[40px] items-center gap-2 rounded-sm px-3 text-sm font-semibold transition ${
                  viewMode === mode.id
                    ? "bg-[var(--primary-1)] text-[var(--foreground-on-brand)]"
                    : "text-[var(--foreground-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]"
                }`}
              >
                <span className="material-symbols-outlined !text-[18px]">{mode.icon}</span>
                {mode.label}
              </button>
            ))}
          </div>
        ) : null}

        {sortState ? (
          <button
            type="button"
            onClick={onClearSort}
            className="civitas-searchbar__action flex min-h-[44px] items-center justify-center gap-2 rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-4 text-sm font-semibold text-[var(--foreground-muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]"
          >
            <span className="material-symbols-outlined !text-[18px]">sort</span>
            Limpar ordenacao
          </button>
        ) : null}
      </div>
    </div>
  );
}
