const SOFT_DELETE_BOOLEAN_KEYS = ["excluido", "deleted", "deletado", "removido"];
const SOFT_DELETE_DATE_KEYS = ["dataExclusao", "deletedAt", "excluidoEm", "removidoEm"];
const SOFT_DELETE_STATUS_KEYS = ["statusExclusao", "situacaoExclusao", "statusExclusaoLabel"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasFilledValue = (value: unknown): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
};

const isDeletedStatus = (value: unknown): boolean => {
  if (value === true) return true;

  if (typeof value !== "string") {
    return false;
  }

  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  return ["excluido", "deletado", "deleted", "removido"].includes(normalized);
};

export const isSoftDeletedRecord = (value: unknown): boolean => {
  if (!isRecord(value)) return false;

  if (SOFT_DELETE_BOOLEAN_KEYS.some((key) => value[key] === true)) {
    return true;
  }

  if (SOFT_DELETE_DATE_KEYS.some((key) => hasFilledValue(value[key]))) {
    return true;
  }

  return SOFT_DELETE_STATUS_KEYS.some((key) => isDeletedStatus(value[key]));
};

export const filterActiveRecords = <T>(items: T[]): T[] =>
  items.filter((item) => !isSoftDeletedRecord(item));
