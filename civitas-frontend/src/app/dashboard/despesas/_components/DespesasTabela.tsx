import { useMemo, useState } from "react";
import Input from "@/components/Input";
import Table from "@/components/Table/table";
import type { TableColumn } from "@/components/Table/export-types";
import type { TablePaginationConfig } from "@/components/Table/table";
import { normalizeDateInput } from "@/global/formPayload";
import { despesaService } from "@/hooks/despesa";
import { documentoService } from "@/hooks/documento";
import { showToast } from "@/hooks/useToast";
import type { DespesaDashboardRow } from "@/hooks/useDespesasDashboard";
import { ICON_BUTTON_CLASS_NAME } from "../despesas.constants";
import type { DespesasListSearchState, DespesasTableData } from "../despesas.types";
import { getDespesaCodigo, getStatusBadgeClassName } from "../despesas.utils";

type DespesasTabelaProps = {
  listSectionRef: React.RefObject<HTMLElement | null>;
  search: DespesasListSearchState;
  tableData: DespesasTableData;
  loading: boolean;
  error: string | null;
  canExport: boolean;
  onOpenExport: () => void;
  paginationEnabled?: boolean;
  pagination?: TablePaginationConfig;
  onView: (despesa: DespesaDashboardRow) => void;
  onEdit: (despesa: DespesaDashboardRow) => void;
  onDelete: (despesa: DespesaDashboardRow) => void;
  onPayment: (despesa: DespesaDashboardRow) => void;
};

export default function DespesasTabela({
  listSectionRef,
  search,
  tableData,
  loading,
  error,
  canExport,
  onOpenExport,
  paginationEnabled,
  pagination,
  onView,
  onEdit,
  onDelete,
  onPayment,
}: DespesasTabelaProps) {
  const resolveSortDate = (despesa: DespesaDashboardRow): string => {
    return (
      normalizeDateInput(despesa.raw.dataVencimento) ??
      normalizeDateInput(despesa.raw.dataEmissao) ??
      normalizeDateInput(despesa.raw.dataEmicao) ??
      normalizeDateInput(despesa.raw.data) ??
      despesa.dataFormatada
    );
  };

  const columns = useMemo<TableColumn[]>(
    () => [
      {
        id: "codigo",
        label: "Codigo",
        render: (row) => {
          const despesa = row as DespesaDashboardRow;
          return (
            <span className="text-sm font-semibold text-[var(--secundary-1)]">
              {getDespesaCodigo(despesa)}
            </span>
          );
        },
        sortValue: (row) => getDespesaCodigo(row as DespesaDashboardRow),
      },
      {
        id: "tipoCodigo",
        label: "Tipo codigo",
        render: (row) => {
          const despesa = row as DespesaDashboardRow;
          return (
            <span className="text-sm font-semibold text-[var(--foreground)]">
              {despesa.tipoCodigoNome}
            </span>
          );
        },
        sortValue: (row) => (row as DespesaDashboardRow).tipoCodigoNome,
      },
      {
        id: "consumoPrevisto",
        label: "Consumo Previsto",
        sortType: "number",
        render: (row) => {
          const despesa = row as DespesaDashboardRow;
          return (
            <span className="text-sm font-semibold text-[var(--foreground)]">
              {despesa.raw.consumoPrevisto != null ? despesa.raw.consumoPrevisto : "-"}
            </span>
          );
        },
        sortValue: (row) => (row as DespesaDashboardRow).raw.consumoPrevisto ?? null,
      },
      {
        id: "categoria",
        label: "Categoria",
        render: (row) => {
          const despesa = row as DespesaDashboardRow;
          return (
            <span className="text-sm font-semibold text-[var(--foreground)]">
              {despesa.categoria}
            </span>
          );
        },
        sortValue: (row) => (row as DespesaDashboardRow).categoria,
      },
      {
        id: "descricao",
        label: "Descricao",
        render: (row) => {
          const despesa = row as DespesaDashboardRow;
          return (
            <span className="text-sm text-[var(--foreground-muted)]">
              {despesa.descricao}
            </span>
          );
        },
        sortValue: (row) => (row as DespesaDashboardRow).descricao,
      },
      {
        id: "valor",
        label: "Valor",
        sortType: "number",
        render: (row) => {
          const despesa = row as DespesaDashboardRow;
          return (
            <span className="text-sm font-semibold text-[var(--secundary-1)]">
              {despesa.valorFormatado}
            </span>
          );
        },
        sortValue: (row) => (row as DespesaDashboardRow).valor,
      },
      {
        id: "data",
        label: "Data",
        sortType: "date",
        render: (row) => {
          const despesa = row as DespesaDashboardRow;
          return (
            <span className="text-sm text-[var(--foreground-muted)]">
              {despesa.dataFormatada}
            </span>
          );
        },
        sortValue: (row) => resolveSortDate(row as DespesaDashboardRow),
      },
      {
        id: "situacao",
        label: "Situacao",
        sortable: false,
        render: (row) => {
          const despesa = row as DespesaDashboardRow;
          return (
            <span
              className={`despesas-table-status-badge civitas-badge min-w-[84px] ${getStatusBadgeClassName(
                despesa.situacao
              )}`}
            >
              {despesa.situacaoLabel}
            </span>
          );
        },
        sortValue: (row) => (row as DespesaDashboardRow).situacao,
        sortType: "number",
      },
      {
        id: "documento",
        label: "Documento",
        sortable: false,
        render: (row) => <DocumentoAction despesa={row as DespesaDashboardRow} />,
      },
    ],
    []
  );

  const emptyDescription = tableData.hasLocalListSearch
    ? "Nenhuma despesa encontrada para o codigo ou instituicao informados."
    : "Nenhuma despesa encontrada com os filtros atuais.";

  const shouldPaginate = Boolean(paginationEnabled && pagination);

  return (
    <section
      ref={listSectionRef}
      className="despesas-table-section civitas-table-shell civitas-enter overflow-hidden rounded-sm"
    >
      <div className="despesas-table-header border-b border-[var(--divider)] px-5 py-5 sm:px-6">
        <h3 className="text-[36px] font-bold leading-none text-[var(--secundary-1)]">
          Listagem de despesas
        </h3>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Painel com leitura rapida de categoria, valor, data, situacao e acoes
          de manutencao. Use os filtros abaixo para isolar um unico codigo ou
          uma instituicao especifica.
        </p>
      </div>

      <div className="despesas-table-filterbar grid gap-4 border-b border-[var(--divider)] px-4 py-4 sm:px-5 lg:grid-cols-[1fr_1fr_auto] lg:px-6">
        <Input
          value={search.codigoSearch}
          onChange={(event) => search.setCodigoSearch(event.target.value)}
          label="Filtrar por codigo"
          placeholder="Ex.: contrato, energia, 001"
        />
        <Input
          value={search.instituicaoSearch}
          onChange={(event) => search.setInstituicaoSearch(event.target.value)}
          label="Filtrar por instituicao"
          placeholder="Ex.: escola, secretaria, unidade"
        />
        <button
          type="button"
          onClick={() => {
            search.setCodigoSearch("");
            search.setInstituicaoSearch("");
          }}
          className="civitas-action civitas-action--ghost self-end rounded-sm px-4 py-2.5 text-sm"
        >
          Limpar listagem
        </button>
      </div>

      {canExport ? (
        <div className="despesas-table-exportbar flex flex-col gap-3 border-b border-[var(--divider)] px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-5 lg:px-6">
          <button
            type="button"
            onClick={onOpenExport}
            className="civitas-searchbar__action flex w-full items-center justify-center gap-2 rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-5 py-2.5 font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)] sm:w-auto"
          >
            <span className="material-symbols-outlined text-base text-[var(--foreground)]">
              print
            </span>
            Exportar / Imprimir
          </button>
        </div>
      ) : null}

      <div className="px-4 py-5 sm:px-6">
        {shouldPaginate ? (
          <Table
            data={tableData.visibleDespesas}
            columns={columns}
            renderRowActions={(row) => {
              const despesa = row as DespesaDashboardRow;
              return (
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onView(despesa)}
                    className={`${ICON_BUTTON_CLASS_NAME} despesas-table-action`}
                    aria-label={`Visualizar ${despesa.registro}`}
                  >
                    <span className="material-symbols-outlined !text-[18px]">visibility</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(despesa)}
                    className={`${ICON_BUTTON_CLASS_NAME} despesas-table-action`}
                    aria-label={`Editar ${despesa.registro}`}
                  >
                    <span className="material-symbols-outlined !text-[18px]">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onPayment(despesa)}
                    className={`${ICON_BUTTON_CLASS_NAME} despesas-table-action`}
                    aria-label={`Atualizar pagamento ${despesa.registro}`}
                  >
                    <span className="material-symbols-outlined !text-[18px]">payments</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(despesa)}
                    className="despesas-table-action despesas-table-action--danger flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--status-inactive-text)] shadow-[var(--shadow-xs)] transition-all duration-[var(--motion-duration-fast)] hover:-translate-y-[1px] hover:bg-[var(--surface-danger-soft)] hover:shadow-[var(--shadow-sm)]"
                    aria-label={`Remover ${despesa.registro}`}
                  >
                    <span className="material-symbols-outlined !text-[18px]">delete</span>
                  </button>
                </div>
              );
            }}
            isLoading={loading}
            errorMessage={error}
            emptyTitle="Nenhuma despesa encontrada"
            emptyDescription={emptyDescription}
            exportConfig={{ enabled: false }}
            paginationEnabled
            pagination={pagination!}
          />
        ) : (
          <Table
            data={tableData.visibleDespesas}
            columns={columns}
            renderRowActions={(row) => {
              const despesa = row as DespesaDashboardRow;
              return (
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onView(despesa)}
                    className={`${ICON_BUTTON_CLASS_NAME} despesas-table-action`}
                    aria-label={`Visualizar ${despesa.registro}`}
                  >
                    <span className="material-symbols-outlined !text-[18px]">visibility</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(despesa)}
                    className={`${ICON_BUTTON_CLASS_NAME} despesas-table-action`}
                    aria-label={`Editar ${despesa.registro}`}
                  >
                    <span className="material-symbols-outlined !text-[18px]">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onPayment(despesa)}
                    className={`${ICON_BUTTON_CLASS_NAME} despesas-table-action`}
                    aria-label={`Atualizar pagamento ${despesa.registro}`}
                  >
                    <span className="material-symbols-outlined !text-[18px]">payments</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(despesa)}
                    className="despesas-table-action despesas-table-action--danger flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--status-inactive-text)] shadow-[var(--shadow-xs)] transition-all duration-[var(--motion-duration-fast)] hover:-translate-y-[1px] hover:bg-[var(--surface-danger-soft)] hover:shadow-[var(--shadow-sm)]"
                    aria-label={`Remover ${despesa.registro}`}
                  >
                    <span className="material-symbols-outlined !text-[18px]">delete</span>
                  </button>
                </div>
              );
            }}
            isLoading={loading}
            errorMessage={error}
            emptyTitle="Nenhuma despesa encontrada"
            emptyDescription={emptyDescription}
            exportConfig={{ enabled: false }}
          />
        )}
      </div>

      <div className="despesas-table-footer flex flex-col gap-2 border-t border-[var(--divider)] bg-[var(--surface-subtle)] px-5 py-4 text-sm text-[var(--foreground-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>{tableData.listResume}</span>
        <span>Ultima atualizacao: {tableData.lastUpdatedLabel}</span>
      </div>
    </section>
  );
}

function DocumentoAction({ despesa }: { despesa: DespesaDashboardRow }) {
  const [isOpening, setIsOpening] = useState(false);
  const documento = despesa.documento;

  if (!despesa.documentoConfiavel) {
    return (
      <span className="inline-flex min-h-9 items-center rounded-sm border border-dashed border-[var(--border-soft)] px-3 text-xs font-semibold text-[var(--foreground-muted)]">
        Sem anexo
      </span>
    );
  }

  const handleOpen = async () => {
    try {
      setIsOpening(true);
      const resolvedDocumento =
        documento?.digitalizacao
          ? documento
          : despesa.idDocumento
            ? await documentoService.getDocumentoDataById(despesa.idDocumento)
            : null;

      if (resolvedDocumento?.digitalizacao) {
        const fileType = resolvedDocumento.fileType || "application/pdf";
        const blob = base64ToBlob(resolvedDocumento.digitalizacao, fileType);
        openBlob(blob);
        return;
      }

      if (despesa.raw.hashDocumento) {
        const blob = await despesaService.getDocumentoBlobByHash(despesa.raw.hashDocumento);
        openBlob(blob);
        return;
      }

      if (!resolvedDocumento?.digitalizacao) {
        showToast("Documento nao foi encontrado para abertura.", "error");
        return;
      }
    } catch (error) {
      console.error("Erro ao abrir documento da despesa.", error);
      showToast("Nao foi possivel abrir o documento.", "error");
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleOpen()}
      disabled={isOpening}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)]"
      aria-label={`Abrir documento da despesa ${despesa.registro}`}
    >
      <span className="material-symbols-outlined !text-[16px]" aria-hidden="true">
        attach_file
      </span>
      {isOpening ? "Abrindo..." : "Abrir"}
    </button>
  );
}

const openBlob = (blob: Blob): void => {
  const url = window.URL.createObjectURL(blob);
  const openedWindow = window.open(url, "_blank", "noopener,noreferrer");

  if (!openedWindow) {
    showToast("O navegador bloqueou a abertura do documento.", "error");
  }

  window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
};

const base64ToBlob = (base64: string, fileType: string): Blob => {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: fileType });
};
