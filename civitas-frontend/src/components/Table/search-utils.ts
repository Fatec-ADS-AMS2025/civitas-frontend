export type SearchFieldType = "text" | "select";

export type SearchFieldConfig = {
  key: string;
  placeholder: string;
  local: "principal" | "filtro";
  value?: string | number;
  type?: SearchFieldType;
  options?: { value: string | number; label: string }[];
};

const normalizeText = (value: unknown): string => {
  if (value === null || value === undefined) return "";

  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
};

const includesNormalized = (source: unknown, target: string): boolean => {
  if (!target) return true;
  return normalizeText(source).includes(target);
};

const matchesGlobal = (item: Record<string, unknown>, query: string, globalFields: SearchFieldConfig[]): boolean => {
  if (!query) return true;
  if (globalFields.length === 0) return false;

  return globalFields.some((field) => includesNormalized(item[field.key], query));
};

const matchesAdvanced = (
  item: Record<string, unknown>,
  advancedFilters: Record<string, string>,
  allFields: SearchFieldConfig[],
): boolean => {
  return allFields.every((field) => {
    const filterValue = advancedFilters[field.key] || "";
    if (!filterValue) return true;
    return includesNormalized(item[field.key], filterValue);
  });
};

export const buildInitialAdvancedFilters = (fields: SearchFieldConfig[]): Record<string, string> => {
  return fields.reduce<Record<string, string>>((acc, field) => {
    acc[field.key] = String(field.value ?? "");
    return acc;
  }, {});
};

export const applySearchFilters = <T extends Record<string, unknown>>(
  data: T[],
  fields: SearchFieldConfig[],
  globalQuery: string,
  advancedFilters: Record<string, string>,
): T[] => {
  const normalizedGlobalQuery = normalizeText(globalQuery);
  const normalizedAdvanced = Object.entries(advancedFilters).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key] = normalizeText(value);
    return acc;
  }, {});

  const globalFields = fields.filter((field) => field.local === "principal");

  return data.filter((item) => {
    const globalOk = matchesGlobal(item, normalizedGlobalQuery, globalFields);
    const advancedOk = matchesAdvanced(item, normalizedAdvanced, fields);
    return globalOk && advancedOk;
  });
};
