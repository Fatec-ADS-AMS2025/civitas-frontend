"use client";

import React, { useEffect, useMemo, useState } from "react";
import Modal from "../modal";
import type {
  TableColumn,
  TableExportOptions,
  TableExportOutputType,
  TableExportScope,
} from "./export-types";

type ExportModalProps = {
  open: boolean;
  title: string;
  columns: TableColumn[];
  filteredCount: number;
  allCount: number;
  isGenerating: boolean;
  onClose: () => void;
  onGenerate: (options: TableExportOptions) => Promise<void>;
};

const DEFAULT_OUTPUT_TYPE: TableExportOutputType = "xlsx";
export default function ExportModal({
  open,
  title,
  columns,
  filteredCount,
  allCount,
  isGenerating,
  onClose,
  onGenerate,
}: ExportModalProps) {
  const [outputType, setOutputType] = useState<TableExportOutputType>(DEFAULT_OUTPUT_TYPE);
  const [scope, setScope] = useState<TableExportScope>("filtered");
  const [selectedColumnIds, setSelectedColumnIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setOutputType(DEFAULT_OUTPUT_TYPE);
    setScope(filteredCount > 0 ? "filtered" : "all");
    setSelectedColumnIds(columns.map((column) => column.id));
  }, [columns, filteredCount, open]);

  const selectedCount = selectedColumnIds.length;
  const selectedScopeCount = scope === "filtered" ? filteredCount : allCount;
  const hasSelectedColumns = selectedCount > 0;
  const hasDataForScope = selectedScopeCount > 0;
  const disableGenerate = isGenerating || !hasSelectedColumns || !hasDataForScope;

  const selectionLabel = useMemo(() => {
    if (columns.length === 0) {
      return "Nenhuma coluna disponivel";
    }

    return `${selectedCount} de ${columns.length} colunas selecionadas`;
  }, [columns.length, selectedCount]);

  const toggleColumn = (columnId: string) => {
    setSelectedColumnIds((current) => {
      if (current.includes(columnId)) {
        return current.filter((id) => id !== columnId);
      }

      return [...current, columnId];
    });
  };

  const handleGenerate = async () => {
    if (disableGenerate) {
      return;
    }

    await onGenerate({
      outputType,
      scope,
      selectedColumnIds,
    });
  };

  return (
    <Modal setValue={onClose} value={open}>
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--primary-1)]">
            Exportacao / Impressao
          </p>
          <h2 className="text-2xl font-semibold text-[var(--foreground)]">{title}</h2>
          <p className="text-sm text-[var(--foreground-muted)]">
            Escolha o formato, as colunas e o escopo dos dados que devem sair no arquivo.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
          <section className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">Tipo de saida</p>
            <div className="mt-3 space-y-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-4 py-3 text-sm text-[var(--foreground)]">
                <input
                  type="radio"
                  name="export-output-type"
                  value="xlsx"
                  checked={outputType === "xlsx"}
                  onChange={() => setOutputType("xlsx")}
                  className="mt-1 h-4 w-4 accent-[var(--primary-1)]"
                />
                <span>
                  <strong className="block font-semibold">Excel (.xlsx)</strong>
                  <span className="text-[var(--foreground-muted)]">Planilha com cabecalho destacado e colunas ajustadas.</span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-4 py-3 text-sm text-[var(--foreground)]">
                <input
                  type="radio"
                  name="export-output-type"
                  value="pdf"
                  checked={outputType === "pdf"}
                  onChange={() => setOutputType("pdf")}
                  className="mt-1 h-4 w-4 accent-[var(--primary-1)]"
                />
                <span>
                  <strong className="block font-semibold">PDF</strong>
                  <span className="text-[var(--foreground-muted)]">Arquivo pronto para compartilhamento e impressao.</span>
                </span>
              </label>
            </div>
          </section>

          <section className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Colunas</p>
                <p className="text-sm text-[var(--foreground-muted)]">{selectionLabel}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedColumnIds(columns.map((column) => column.id))}
                  className="rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)]"
                >
                  Marcar todas
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedColumnIds([])}
                  className="rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)]"
                >
                  Limpar
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {columns.map((column) => (
                <label
                  key={column.id}
                  className="flex cursor-pointer items-center gap-3 rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm font-medium text-[var(--foreground)]"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumnIds.includes(column.id)}
                    onChange={() => toggleColumn(column.id)}
                    className="h-4 w-4 accent-[var(--primary-1)]"
                  />
                  <span>{column.label}</span>
                </label>
              ))}
            </div>

            {!hasSelectedColumns ? (
              <p className="mt-3 text-sm font-medium text-[var(--text-danger)]">
                Selecione ao menos uma coluna para gerar o arquivo.
              </p>
            ) : null}
          </section>
        </div>

        <section className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4">
          <p className="text-sm font-semibold text-[var(--foreground)]">Escopo dos dados</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-[var(--border-default)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--foreground)]">
              <input
                type="radio"
                name="export-scope"
                value="filtered"
                checked={scope === "filtered"}
                onChange={() => setScope("filtered")}
                className="mt-1 h-4 w-4 accent-[var(--primary-1)]"
              />
              <span>
                <strong className="block font-semibold">Apenas dados filtrados da tela</strong>
                <span className="text-[var(--foreground-muted)]">{filteredCount} registro(s) disponivel(is).</span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-[var(--border-default)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--foreground)]">
              <input
                type="radio"
                name="export-scope"
                value="all"
                checked={scope === "all"}
                onChange={() => setScope("all")}
                className="mt-1 h-4 w-4 accent-[var(--primary-1)]"
              />
              <span>
                <strong className="block font-semibold">Todos os registros carregados</strong>
                <span className="text-[var(--foreground-muted)]">{allCount} registro(s) disponivel(is).</span>
              </span>
            </label>
          </div>

          {!hasDataForScope ? (
            <p className="mt-3 text-sm font-medium text-[var(--text-danger)]">
              Nao ha dados disponiveis para o escopo selecionado.
            </p>
          ) : null}
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-5 py-3 font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={disableGenerate}
            className="rounded-sm border border-[var(--primary-1)] bg-[var(--primary-1)] px-5 py-3 font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? "Gerando..." : outputType === "pdf" ? "Gerar PDF" : "Gerar Excel"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
