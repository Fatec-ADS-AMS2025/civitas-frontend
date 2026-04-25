import React from "react";
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
      <mark className="rounded bg-[#FDE7D4] px-1 text-[#A84A1D]">{label.slice(range.start, range.end)}</mark>
      {label.slice(range.end)}
    </>
  );
};

const getFeatureMatch = (features: string[], query: string) => {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return features[0] ?? "";
  }

  return (
    features.find((feature) =>
      normalizeSearchText(feature).includes(normalizedQuery)
    ) ?? features[0] ?? ""
  );
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
      <div className="rounded-xl border border-dashed border-[#BFD4D9] bg-[#F5FAFB] px-3 py-5 text-center">
        <p className="font-detail text-sm font-medium text-[#547480]">
          Nenhum resultado encontrado para a busca.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
      {groups.map((group) => (
        <section key={group.category} className="space-y-2">
          <h3 className="font-detail px-1 text-xs font-semibold uppercase tracking-[0.06em] text-[#9CB1B8]">
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
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors duration-150 ${
                    isSelected
                      ? "bg-[#DDF0F2] text-[#003A42]"
                      : isActiveRoute
                        ? "bg-[#E9F6F7] text-[#004D57]"
                        : "text-[#234852] hover:bg-[#F1F8F9]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {entry.item.icon ?? "apps"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      <HighlightedLabel label={entry.item.label} query={query} />
                    </div>
                    {featureMatch ? (
                      <div
                        className={`mt-0.5 truncate text-xs ${
                          isSelected || isActiveRoute
                            ? "text-[#37656D]"
                            : "text-[#9FC0C8] group-hover:text-[#CFE3E7]"
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
