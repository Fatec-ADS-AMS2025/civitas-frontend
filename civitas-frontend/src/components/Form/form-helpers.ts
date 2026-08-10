import { formatMaskedValue, normalizeMaskedValue } from "@/lib/input-mask";
import type { FormFieldConfig } from "./form";
import { toLabel } from "./form-utils";

const DEFAULT_HIDDEN_FIELDS = ["id"];

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const toOptionalNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const toPositiveNumberOrZero = (...values: unknown[]): number => {
  for (const value of values) {
    const parsedValue = toOptionalNumber(value);
    if (parsedValue !== undefined && parsedValue > 0) return parsedValue;
  }

  return 0;
};

const normalizeDocumentValue = (value: Record<string, unknown>, source: Record<string, unknown> = {}) => ({
  idDocumento: toOptionalNumber(value.idDocumento) ?? 0,
  digitalizacao: typeof value.digitalizacao === "string" ? value.digitalizacao : "",
  numeroDocumento: toPositiveNumberOrZero(value.numeroDocumento, source.numeroDocumento),
  idFornecedor: toPositiveNumberOrZero(value.idFornecedor, source.idFornecedor, source.fornecedorId),
  fileName: typeof value.fileName === "string" ? value.fileName : undefined,
  fileType: typeof value.fileType === "string" ? value.fileType : undefined,
  fileSize: toOptionalNumber(value.fileSize) ?? undefined,
  status: typeof value.status === "string" ? value.status : undefined,
  isPersisted: value.isPersisted === true,
});

const resolveDocumentFieldValue = (
  field: FormFieldConfig | undefined,
  source: Record<string, unknown>,
  value: unknown,
): unknown => {
  if (field?.type !== "documento") return value;
  if (isRecord(value)) return normalizeDocumentValue(value, source);
  return "";
};

const inferFieldType = (value: unknown): FormFieldConfig["type"] => {
  if (typeof value === "number") return "number";
  return "text";
};

// Cria um config basico quando nao ha definicao explicita.
const toFieldConfig = (key: string, sourceValue?: unknown): FormFieldConfig => ({
  key,
  label: toLabel(key),
  placeholder: toLabel(key),
  type: inferFieldType(sourceValue),
});

const formatValueForFieldState = (field: FormFieldConfig | undefined, value: unknown): unknown => {
  if (!field) return value;
  if (value === undefined || value === null) return value;

  if (field.mask) {
    return formatMaskedValue(field.mask, value);
  }

  if (field.type === "documento") {
    return resolveDocumentFieldValue(field, {}, value);
  }

  return value;
};

const normalizeFieldValue = (
  field: FormFieldConfig | undefined,
  value: unknown,
  stage: "change" | "submit",
  source: Record<string, unknown> = {},
): unknown => {
  // Normaliza valores por campo para manter change vs submit consistente.
  if (!field) return value;
  if (value === undefined || value === null) return value;

  if (field.mask) {
    if (stage === "change") {
      return formatMaskedValue(field.mask, value);
    }

    value = normalizeMaskedValue(field.mask, value);
  }

  // Selects devem manter o value original quando possível.
  if (field.type === "documento") {
    if (value === "") return "";
    if (!isRecord(value)) return "";

    const normalizedDocument = normalizeDocumentValue(value, source);
    if (stage === "submit") return normalizedDocument;

    return {
      ...value,
      ...normalizedDocument,
    };
  }

  if (field.type === "select") {
    if (value === "") return "";
    const matchingOption = field.options?.find((option) => String(option.value) === String(value));
    return matchingOption ? matchingOption.value : value;
  }

  // Numbers só são convertidos no submit.
  if (field.type === "number") {
    if (value === "") return "";
    if (typeof value === "number") return value;

    const textValue = String(value).trim();
    if (textValue.length === 0) return "";
    if (stage === "change") return textValue;

    const parsedValue = Number(textValue);
    return Number.isNaN(parsedValue) ? value : parsedValue;
  }

  return value;
};

const buildDisplayFormData = (
  source: Record<string, unknown>,
  mergedFields: FormFieldConfig[],
  fieldMap: Map<string, FormFieldConfig>,
): Record<string, unknown> => {
  // Aplica masks e formatadores no estado inicial da UI.
  const keysToNormalize = mergedFields.length > 0 ? mergedFields.map((field) => field.key) : Object.keys(source);

  return Object.fromEntries(
    keysToNormalize.map((key) => {
      const field = fieldMap.get(key);
      const value = resolveDocumentFieldValue(field, source, source[key]);
      return [key, formatValueForFieldState(field, value)];
    }),
  );
};

const buildNormalizedFormData = (
  source: Record<string, unknown>,
  mergedFields: FormFieldConfig[],
  fieldMap: Map<string, FormFieldConfig>,
  stage: "change" | "submit",
): Record<string, unknown> => {
  // Converte UI para valores prontos no submit (numbers, selects, masks).
  const keysToNormalize = mergedFields.length > 0 ? mergedFields.map((field) => field.key) : Object.keys(source);

  const normalizedEntries = keysToNormalize.map((key) => {
    const field = fieldMap.get(key);
    return [key, normalizeFieldValue(field, source[key], stage, source)] as const;
  });

  return Object.fromEntries(normalizedEntries);
};

export { buildDisplayFormData, buildNormalizedFormData, DEFAULT_HIDDEN_FIELDS, normalizeFieldValue, toFieldConfig };
