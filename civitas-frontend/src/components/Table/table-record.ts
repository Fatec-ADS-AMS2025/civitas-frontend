import type React from "react";
import type { TableRow } from "./table-types";

export const toRecord = <T extends TableRow>(value: T): Record<string, unknown> =>
  value as Record<string, unknown>;

export const getResolvedId = <T extends TableRow>(row: T): number => {
  const record = toRecord(row);
  const idField =
    record.id !== undefined
      ? "id"
      : record.idSecretaria !== undefined
        ? "idSecretaria"
        : record.idFornecedor !== undefined
          ? "idFornecedor"
          : record.idOrcamento !== undefined
            ? "idOrcamento"
            : "id";
  const rawValue = record[idField];
  const resolvedId = typeof rawValue === "number" ? rawValue : Number(rawValue);

  if (!Number.isFinite(resolvedId)) {
    throw new Error("ID invalido para a operacao.");
  }

  return resolvedId;
};

export const getMotionStyle = (index: number): React.CSSProperties | undefined =>
  index > 5 ? undefined : { ["--enter-delay" as string]: `${index * 45}ms` };
