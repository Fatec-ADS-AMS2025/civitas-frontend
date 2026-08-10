"use client";

import Button from "@/components/button";
import Input from "@/components/Input";

export const MAX_CAMPOS_ADICIONAIS = 20;

export type CamposAdicionaisValue = Record<string, string | number | boolean | null>;

export type CampoAdicionalRow = {
  id: string;
  nome: string;
  valor: string;
};

type DespesaCamposAdicionaisProps = {
  rows: CampoAdicionalRow[];
  errors?: Record<string, string | undefined>;
  disabled?: boolean;
  onChange: (rows: CampoAdicionalRow[]) => void;
};

const createRowId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const camposAdicionaisFromObject = (value?: CamposAdicionaisValue | null): CampoAdicionalRow[] => {
  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.entries(value)
    .slice(0, MAX_CAMPOS_ADICIONAIS)
    .map(([nome, valor]) => ({
      id: createRowId(),
      nome,
      valor: valor === null || valor === undefined ? "" : String(valor),
    }));
};

export const camposAdicionaisToObject = (rows: CampoAdicionalRow[]): CamposAdicionaisValue | undefined => {
  const entries = rows
    .map((row) => ({
      nome: row.nome.trim(),
      valor: row.valor.trim(),
    }))
    .filter((row) => row.nome.length > 0);

  if (entries.length === 0) {
    return undefined;
  }

  return entries.reduce<CamposAdicionaisValue>((accumulator, row) => {
    accumulator[row.nome] = row.valor.length > 0 ? row.valor : null;
    return accumulator;
  }, {});
};

export const validateCamposAdicionaisRows = (rows: CampoAdicionalRow[]): Record<string, string> => {
  const nextErrors: Record<string, string> = {};

  if (rows.length > MAX_CAMPOS_ADICIONAIS) {
    nextErrors.camposAdicionais = `Uma despesa pode ter no maximo ${MAX_CAMPOS_ADICIONAIS} campos adicionais.`;
  }

  const seen = new Set<string>();
  rows.forEach((row) => {
    const nome = row.nome.trim();
    const normalizedNome = nome.toLocaleLowerCase("pt-BR");

    if (!nome) {
      nextErrors[`campoAdicionalNome.${row.id}`] = "Informe o nome do campo.";
      return;
    }

    if (nome.length > 100) {
      nextErrors[`campoAdicionalNome.${row.id}`] = "Nome deve ter no maximo 100 caracteres.";
      return;
    }

    if (seen.has(normalizedNome)) {
      nextErrors[`campoAdicionalNome.${row.id}`] = "Nome duplicado.";
      return;
    }

    seen.add(normalizedNome);
  });

  return nextErrors;
};

export default function DespesaCamposAdicionais({ rows, errors, disabled, onChange }: DespesaCamposAdicionaisProps) {
  const canAdd = !disabled && rows.length < MAX_CAMPOS_ADICIONAIS;

  const handleAdd = () => {
    if (!canAdd) return;
    onChange([...rows, { id: createRowId(), nome: "", valor: "" }]);
  };

  const handleUpdate = (id: string, key: "nome" | "valor", value: string) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const handleRemove = (id: string) => {
    if (disabled) return;
    onChange(rows.filter((row) => row.id !== id));
  };

  return (
    <div>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)] whitespace-nowrap">
            Campos adicionais
          </p>
          <div className="h-px flex-1 bg-[var(--border-soft)]" />
          <span className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-2 py-0.5 text-xs font-semibold text-[var(--foreground-muted)]">
            {rows.length}/{MAX_CAMPOS_ADICIONAIS}
          </span>
        </div>
        {!disabled ? (
          <Button variant="secondary" type="button" onClick={handleAdd} disabled={!canAdd} className="sm:w-auto">
            <span className="material-symbols-outlined !text-[17px]">add</span>
            Novo campo adicional
          </Button>
        ) : null}
      </div>

      {errors?.camposAdicionais ? (
        <p className="mb-3 text-sm font-medium text-[var(--tone-danger-text)]">{errors.camposAdicionais}</p>
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-sm border border-dashed border-[var(--border-soft)] bg-[var(--surface-subtle)] px-4 py-5 text-sm text-[var(--foreground-muted)]">
          Nenhum campo adicional cadastrado.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid gap-3 rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <Input
                label="Nome do campo"
                placeholder="Ex.: contrato"
                disabled={disabled}
                value={row.nome}
                error={errors?.[`campoAdicionalNome.${row.id}`]}
                onChange={(event) => handleUpdate(row.id, "nome", event.target.value)}
              />
              <Input
                label="Valor"
                placeholder="Pode ficar vazio"
                disabled={disabled}
                value={row.valor}
                onChange={(event) => handleUpdate(row.id, "valor", event.target.value)}
              />
              {!disabled ? (
                <button
                  type="button"
                  aria-label="Remover campo adicional"
                  title="Remover campo adicional"
                  onClick={() => handleRemove(row.id)}
                  className="flex h-11 w-11 items-center justify-center self-end rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] text-[var(--foreground-muted)] transition-all hover:border-[var(--tone-danger-border)] hover:text-[var(--tone-danger-text)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)]"
                >
                  <span className="material-symbols-outlined !text-[18px]">delete</span>
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
