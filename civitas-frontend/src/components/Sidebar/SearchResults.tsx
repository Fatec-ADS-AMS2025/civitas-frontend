import { normalizeSearchText } from "@/navigation/navigation.search";
import type { NavigationSearchGroup } from "@/navigation/navigation.types";

type SearchResultsProps = {
  groups: NavigationSearchGroup[];
  query: string;
  selectedKey?: string;
  activePath?: string;
  onSelect: (path: string) => void;
  onHover: (key: string) => void;
};

type HighlightRange = {
  start: number;
  end: number;
};

const normalizeForHighlight = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "");

const getHighlightRange = (label: string, query: string): HighlightRange | null => {
  const normalizedLabelChars: string[] = [];
  const indexMap: number[] = [];

  for (let index = 0; index < label.length; index += 1) {
    const normalizedChar = normalizeForHighlight(label[index]);

    for (let normalizedIndex = 0; normalizedIndex < normalizedChar.length; normalizedIndex += 1) {
      const char = normalizedChar[normalizedIndex];
      if (!char) continue;
      normalizedLabelChars.push(char);
      indexMap.push(index);
    }
  }

  const normalizedLabel = normalizedLabelChars.join("");
  const normalizedQuery = normalizeSearchText(query).split(" ")[0] ?? "";

  if (!normalizedQuery) {
    return null;
  }

  const foundStart = normalizedLabel.indexOf(normalizedQuery);

  if (foundStart < 0) {
    return null;
  }

  const foundEndIndex = foundStart + normalizedQuery.length - 1;
  const start = indexMap[foundStart];
  const end = (indexMap[foundEndIndex] ?? start) + 1;

  return {
    start,
    end,
  };
};

const HighlightedLabel = ({ label, query }: { label: string; query: string }) => {
  const range = getHighlightRange(label, query);

  if (!range) {
    return <>{label}</>;
  }

  return (
    <>
      {label.slice(0, range.start)}
      <mark className="rounded-sm bg-[var(--search-highlight-bg)] px-1 text-[var(--search-highlight-text)]">
        {label.slice(range.start, range.end)}
      </mark>
      {label.slice(range.end)}
    </>
  );
};

const getFeatureMatch = (features: string[], query: string) => {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return features[0] ?? "";
  }

  return features.find((feature) => normalizeSearchText(feature).includes(normalizedQuery)) ?? features[0] ?? "";
};

export default function SearchResults({
  groups,
  query,
  selectedKey,
  activePath,
  onSelect,
  onHover,
}: SearchResultsProps) {
  if (groups.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-[var(--search-empty-border)] bg-[var(--search-empty-bg)] px-3 py-5 text-center">
        <p className="font-detail text-sm font-medium text-[var(--search-empty-text)]">
          Nenhum resultado encontrado para a busca.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
      {groups.map((group) => (
        <section key={group.category} className="space-y-2">
          <h3 className="font-detail px-1 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--search-section-title)]">
            {group.category}
          </h3>

          <div className="space-y-1.5">
            {group.items.map((entry) => {
              const isSelected = selectedKey === entry.item.key;
              const isActiveRoute = activePath === entry.item.path;
              const featureMatch = getFeatureMatch(entry.item.features, query);

              return (
                <button
                  key={entry.item.key}
                  type="button"
                  onClick={() => onSelect(entry.item.path)}
                  onMouseEnter={() => onHover(entry.item.key)}
                  className={`group flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left transition-colors duration-150 ${
                    isSelected
                      ? "bg-[var(--search-result-selected-bg)] text-[var(--search-result-selected-text)]"
                      : isActiveRoute
                        ? "bg-[var(--search-result-active-bg)] text-[var(--search-result-active-text)]"
                        : "text-[var(--search-result-text)] hover:bg-[var(--search-result-hover-bg)]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{entry.item.icon ?? "apps"}</span>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      <HighlightedLabel label={entry.item.label} query={query} />
                    </div>
                    {featureMatch ? (
                      <div
                        className={`mt-0.5 truncate text-xs ${
                          isSelected || isActiveRoute
                            ? "text-[var(--search-result-meta-strong)]"
                            : "text-[var(--search-result-meta)] group-hover:text-[var(--search-result-meta-hover)]"
                        }`}
                      >
                        {featureMatch}
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
