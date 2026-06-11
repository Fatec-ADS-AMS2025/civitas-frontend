import type { ListingConfig, ListingRow } from "../types";

type ListingSelectorProps = {
  configs: ListingConfig<ListingRow>[];
  activeListingId: string;
  onSelect: (listingId: string) => void;
  compact?: boolean;
};

export function ListingSelector({
  configs,
  activeListingId,
  onSelect,
  compact = false,
}: ListingSelectorProps) {
  return (
    <div className={compact ? "grid gap-2 sm:grid-cols-2" : "grid gap-3 md:grid-cols-2 xl:grid-cols-3"}>
      {configs.map((config) => {
        const isActive = config.id === activeListingId;

        return (
          <button
            key={config.id}
            type="button"
            onClick={() => onSelect(config.id)}
            className={`rounded-sm border text-left transition-all duration-[var(--motion-duration-fast)] ${
              compact ? "p-3" : "p-4"
            } ${
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
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
                    {config.category}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-semibold text-[var(--foreground)]">
                  {config.label}
                </h3>
              </div>
              {isActive ? (
                <span className="rounded-sm bg-[var(--primary-1)] px-2 py-1 text-xs font-semibold text-white">
                  Ativa
                </span>
              ) : null}
            </div>
            {!compact ? (
              <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
                {config.description}
              </p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
