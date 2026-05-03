"use client";

import React, { useMemo } from "react";
import Form, { type FieldConfig } from "@/components/Form/form";

export type UcItem = {
  id: number;
  identificador: string;
};

export type DespesaFormValues = {
  ucId: number | "";
  ucIdentificador: string;
  valorDespesa: number | "";
  consumoPrevisto: number | "";
};

type DespesaFormProps = {
  ucs: UcItem[];
  selectedUc: UcItem | null;
  onSelectUc: (uc: UcItem) => void;
  onCancel: () => void;
  onConfirm: (values: DespesaFormValues) => void;
};

// Mensagem padrao usada quando o usuario tenta confirmar sem UC selecionada.
const ucSelectionMessage = "Selecione uma UC na tabela ao lado.";

// Valida se a UC foi escolhida e propagada aos campos somente leitura.
const validateSelectedUc = (value: unknown, formData: Record<string, unknown>) => {
  const ucId = Number(formData.ucId);
  const hasUc = Number.isFinite(ucId) && ucId > 0;
  const hasIdentifier = Boolean(String(value ?? "").trim());

  if (!hasUc || !hasIdentifier) {
    return ucSelectionMessage;
  }

  return undefined;
};

const validatePositiveNumber = (value: unknown, label: string) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return `${label} deve ser maior que zero.`;
  }

  return undefined;
};

const validateNonNegativeNumber = (value: unknown, label: string) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return `${label} nao pode ser negativo.`;
  }

  return undefined;
};

// Rotulos curtos evitam quebra e mantem a primeira linha alinhada.
// Campos de UC ficam somente leitura e os valores financeiros sao obrigatorios.
const DESPESA_FORM_FIELDS: FieldConfig[] = [
  {
    key: "ucId",
    label: "UC (ID)",
    placeholder: "Selecione uma UC",
    disabled: true,
  },
  {
    key: "ucIdentificador",
    label: "Identificador UC",
    placeholder: "Selecione uma UC",
    disabled: true,
    required: true,
    validate: validateSelectedUc,
  },
  {
    key: "valorDespesa",
    label: "Valor da despesa",
    placeholder: "0,00",
    type: "number",
    mask: "currency",
    inputMode: "decimal",
    required: true,
    validate: (value) => validatePositiveNumber(value, "Valor da despesa"),
  },
  {
    key: "consumoPrevisto",
    label: "Consumo previsto",
    placeholder: "0",
    type: "number",
    inputMode: "decimal",
    required: true,
    validate: (value) => validateNonNegativeNumber(value, "Consumo previsto"),
  },
];

const getUcRowClassName = (isSelected: boolean) => {
  // Destaque sutil, mas mais visivel: barra lateral + anel leve na selecao.
  return `group cursor-pointer border-l-4 transition-all duration-[var(--motion-duration-fast)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] ${
    isSelected
      ? "border-[var(--border-accent-teal)] bg-[var(--surface-subtle)] ring-1 ring-[var(--border-accent-teal)]"
      : "border-transparent bg-[var(--surface-elevated)] hover:bg-[var(--surface-subtle)] ring-1 ring-transparent hover:ring-[var(--border-soft)]"
  }`;
};

const ucActionButtonClassName =
  "civitas-action civitas-action--ghost inline-flex h-9 items-center gap-1.5 rounded-sm px-3 text-xs font-semibold";

export default function DespesaForm({
  ucs,
  selectedUc,
  onSelectUc,
  onCancel,
  onConfirm,
}: DespesaFormProps) {
  // Espelha a UC selecionada nos campos do formulario (somente leitura).
  const formObject = useMemo(
    () => ({
      ucId: selectedUc?.id ?? "",
      ucIdentificador: selectedUc?.identificador ?? "",
      valorDespesa: "",
      consumoPrevisto: "",
    }),
    [selectedUc]
  );

  // Acessibilidade: permite selecionar por teclado com Enter/Espaco.
  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>, uc: UcItem) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectUc(uc);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
          Formulario de despesa
        </p>
        <h3 className="mt-2 text-[28px] font-semibold text-[var(--secundary-1)]">
          Selecione uma UC e registre o gasto
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--foreground-muted)]">
          Escolha a unidade consumidora ao lado e preencha os valores financeiros da
          despesa para simular o cadastro.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1.25fr)]">
        <section className="civitas-surface rounded-sm border border-[var(--border-soft)] p-4 shadow-[var(--shadow-xs)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
              Unidades consumidoras
            </p>
            <h4 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
              Lista de UCs disponiveis
            </h4>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Clique em uma linha para selecionar a UC.
            </p>
          </div>

          {/* Lista com scroll e cabecalho fixo para facilitar leitura. */}
          <div className="mt-4 max-h-[360px] overflow-y-auto rounded-sm border border-[var(--border-soft)] bg-[var(--surface-default)]">
            {ucs.length > 0 ? (
              <table className="min-w-full border-separate border-spacing-0 text-left text-[var(--foreground)]">
                <thead className="sticky top-0 z-10 bg-[var(--surface-subtle)] shadow-[var(--shadow-xs)]">
                  <tr className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Identificador</th>
                    <th className="px-4 py-3 text-right">Acao</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-soft)]">
                  {ucs.map((uc) => {
                    const isSelected = selectedUc?.id === uc.id;
                    // Texto do botao fica verde quando a UC ja esta selecionada.
                    const actionTextClassName = isSelected
                      ? "text-[var(--text-accent-teal)]"
                      : "text-[var(--foreground)]";
                    const selectedCellClassName = isSelected
                      ? "text-[var(--text-accent-teal)]"
                      : "text-[var(--foreground)]";
                    const selectedMutedCellClassName = isSelected
                      ? "text-[var(--text-accent-teal)]"
                      : "text-[var(--foreground-muted)]";

                    return (
                      <tr
                        key={uc.id}
                        tabIndex={0}
                        aria-selected={isSelected}
                        className={getUcRowClassName(isSelected)}
                        onClick={() => onSelectUc(uc)}
                        onKeyDown={(event) => handleRowKeyDown(event, uc)}
                      >
                        <td className={`px-4 py-3 text-sm font-semibold ${selectedCellClassName}`}>
                          {String(uc.id).padStart(3, "0")}
                        </td>
                        <td className={`px-4 py-3 text-sm ${selectedMutedCellClassName}`}>
                          {uc.identificador}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {/* Mantem o estilo do botao e evita selecionar duas vezes. */}
                          <button
                            type="button"
                            className={`${ucActionButtonClassName} ${actionTextClassName}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              onSelectUc(uc);
                            }}
                          >
                            {isSelected ? (
                              <>
                                <span className="material-symbols-outlined !text-[16px]">check</span>
                                Selecionada
                              </>
                            ) : (
                              "Selecionar"
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="rounded-sm border border-dashed border-[var(--border-default)] px-4 py-6 text-center text-sm text-[var(--foreground-soft)]">
                Nenhuma UC disponivel no momento.
              </div>
            )}
          </div>
        </section>

        <section className="min-w-0 space-y-4">
          {/* Resumo da UC selecionada para confirmar antes de preencher. */}
          <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
              UC selecionada
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 py-1 font-semibold text-[var(--foreground)]">
                {selectedUc ? String(selectedUc.id).padStart(3, "0") : "Sem selecao"}
              </span>
              <span className="text-[var(--foreground-muted)]">
                {selectedUc ? selectedUc.identificador : "Selecione uma UC na lista"}
              </span>
            </div>
          </div>
          {/* A chave reinicia o formulario quando a UC muda. */}
          <Form
            key={selectedUc?.id ?? "no-uc"}
            object={formObject}
            name="despesa-uc"
            type="create"
            fields={DESPESA_FORM_FIELDS}
            onCancel={onCancel}
            onConfirm={(data) => {
              // O Form retorna um record generico; convertemos para o formato do formulario.
              onConfirm(data as DespesaFormValues);
            }}
          />
        </section>
      </div>
    </div>
  );
}
