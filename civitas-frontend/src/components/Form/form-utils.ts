import type { FormFieldConfig, FormMode } from "./form";

export type GroupedFields = {
  noSection: FormFieldConfig[];
  sections: Record<string, FormFieldConfig[]>;
};

export function groupFieldsBySection(fields: FormFieldConfig[]): GroupedFields {
  // Mantem a ordem das secoes pela primeira aparicao.
  return fields.reduce<GroupedFields>(
    (acc, field) => {
      if (!field.section) {
        acc.noSection.push(field);
      } else {
        if (!acc.sections[field.section]) {
          acc.sections[field.section] = [];
        }
        acc.sections[field.section].push(field);
      }
      return acc;
    },
    {
      noSection: [],
      sections: {},
    },
  );
}

// Preserve order of appearance. Do not replace with Object.keys(sections).
export function getSectionOrder(fields: FormFieldConfig[]): string[] {
  const seen = new Set<string>();
  return fields.reduce((acc: string[], field) => {
    if (field.section && !seen.has(field.section)) {
      seen.add(field.section);
      acc.push(field.section);
    }
    return acc;
  }, []);
}

export const isRecord = (value: unknown): value is Record<string, unknown> => {
  // Evita arrays e nulos ao validar objetos simples.
  return !!value && typeof value === "object" && !Array.isArray(value);
};

export const toInputValue = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  return String(value);
};

export const getFieldErrorId = (fieldKey: string) => `${fieldKey}-error`;

export const isFieldRequired = (field: FormFieldConfig, mode: FormMode): boolean => {
  return Boolean(field.required || field.requiredInModes?.includes(mode));
};

export const isFieldValueEmpty = (field: FormFieldConfig, value: unknown): boolean => {
  if (field.type === "documento") {
    if (!isRecord(value)) return true;
    return typeof value.digitalizacao !== "string" || value.digitalizacao.trim().length === 0;
  }

  if (value === undefined || value === null) return true;
  return String(value).trim().length === 0;
};

// Usa auto-fit para manter o grid legivel em forms grandes.
export const getGridColsClass = (): string => {
  return "grid-cols-[repeat(auto-fit,minmax(250px,1fr))]";
};

// Converte chave tecnica em label amigavel.
export const toLabel = (field: string): string =>
  field
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
