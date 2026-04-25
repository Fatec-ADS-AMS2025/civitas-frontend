import {
  type NavigationItem,
  type NavigationSearchGroup,
  type NavigationSearchMatchType,
  type NavigationSearchResult,
} from "./navigation.types";

const diacriticsRegex = /[\u0300-\u036f]/g;
const punctuationRegex = /[^\p{L}\p{N}\s]/gu;
const spacesRegex = /\s+/g;

export const normalizeSearchText = (value: string): string => {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(diacriticsRegex, "")
    .replace(punctuationRegex, " ")
    .replace(spacesRegex, " ")
    .trim();
};

const resolveMatchType = (
  item: NavigationItem,
  normalizedQuery: string,
): NavigationSearchMatchType | null => {
  const normalizedLabel = normalizeSearchText(item.label);
  const normalizedKeywords = item.keywords.map((keyword) =>
    normalizeSearchText(keyword),
  );
  const normalizedFeatures = item.features.map((feature) =>
    normalizeSearchText(feature),
  );

  if (normalizedLabel.startsWith(normalizedQuery)) {
    return "label-prefix";
  }

  if (normalizedLabel.includes(normalizedQuery)) {
    return "label-includes";
  }

  if (normalizedKeywords.some((keyword) => keyword.startsWith(normalizedQuery))) {
    return "keyword-prefix";
  }

  if (normalizedKeywords.some((keyword) => keyword.includes(normalizedQuery))) {
    return "keyword-includes";
  }

  if (normalizedFeatures.some((feature) => feature.startsWith(normalizedQuery))) {
    return "feature-prefix";
  }

  if (normalizedFeatures.some((feature) => feature.includes(normalizedQuery))) {
    return "feature-includes";
  }

  return null;
};

const matchWeight: Record<NavigationSearchMatchType, number> = {
  "label-prefix": 0,
  "label-includes": 1,
  "keyword-prefix": 2,
  "keyword-includes": 3,
  "feature-prefix": 4,
  "feature-includes": 5,
};

export const searchNavigation = (
  catalog: NavigationItem[],
  query: string,
): NavigationSearchGroup[] => {
  const normalizedQuery = normalizeSearchText(query);

  const ranked = catalog
    .map((item, index) => {
      if (!normalizedQuery) {
        return {
          index,
          item,
          matchType: "label-includes" as NavigationSearchMatchType,
          weight: 99,
        };
      }

      const matchType = resolveMatchType(item, normalizedQuery);

      if (!matchType) {
        return null;
      }

      return {
        index,
        item,
        matchType,
        weight: matchWeight[matchType],
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((left, right) => {
      if (left.weight !== right.weight) {
        return left.weight - right.weight;
      }

      const leftPriority = left.item.priority ?? 0;
      const rightPriority = right.item.priority ?? 0;

      if (leftPriority !== rightPriority) {
        return rightPriority - leftPriority;
      }

      return left.index - right.index;
    });

  const grouped = new Map<string, NavigationSearchResult[]>();

  for (const row of ranked) {
    const items = grouped.get(row.item.category) ?? [];

    items.push({
      item: row.item,
      matchType: row.matchType,
    });

    grouped.set(row.item.category, items);
  }

  return Array.from(grouped.entries()).map(([category, items]) => ({
    category,
    items,
  }));
};
