import { useState, type CSSProperties } from "react";
import { documentoService } from "@/hooks/documento";
import { showToast } from "@/hooks/useToast";
import type { DespesaDashboardRow } from "@/hooks/useDespesasDashboard";
import { ICON_BUTTON_CLASS_NAME } from "../despesas.constants";
import {
  getDespesaCodigo,
  getStatusBadgeClassName,
  isPendingDespesa,
} from "../despesas.utils";

type DespesasTabelaRowsProps = {
  loading: boolean;
  despesas: DespesaDashboardRow[];
  hasLocalListSearch: boolean;
  onView: (despesa: DespesaDashboardRow) => void;
  onEdit: (despesa: DespesaDashboardRow) => void;
  onDelete: (despesa: DespesaDashboardRow) => void;
  onPayment: (despesa: DespesaDashboardRow) => void;
};

export default function DespesasTabelaRows({
  loading,
  despesas,
  hasLocalListSearch,
  onView,
  onEdit,
  onDelete,
  onPayment,
}: DespesasTabelaRowsProps) {
  if (loading) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, rowIndex) => (
          <tr
            key={`loading-row-${rowIndex}`}
            className="despesas-table-row despesas-table-row--loading rounded-sm bg-[var(--surface-subtle)]"
          >
            {Array.from({ length: 10 }).map((__, cellIndex) => (
              <td
                key={`loading-cell-${rowIndex}-${cellIndex}`}
                className="despesas-table-cell px-4 py-5"
              >
                <div className="despesas-table-skeleton h-5 animate-pulse rounded-sm bg-[var(--border-soft)]" />
              </td>
            ))}
          </tr>
        ))}
      </>
    );
  }

  if (despesas.length === 0) {
    return (
      <tr>
        <td
          colSpan={10}
          className="despesas-table-empty rounded-sm border border-dashed border-[var(--border-default)] px-4 py-10 text-center text-[var(--foreground-soft)]"
        >
          {hasLocalListSearch
            ? "Nenhuma despesa encontrada para o codigo ou instituicao informados."
            : "Nenhuma despesa encontrada com os filtros atuais."}
        </td>
      </tr>
    );
  }

  return (
    <>
      {despesas.map((despesa, index) => (
        <tr
          key={despesa.id}
          style={getEnterDelayStyle(index)}
          className={`${index < 6 ? "civitas-enter " : ""}despesas-table-row ${
            // Destaque pendentes (A pagar/Atrasada) para facilitar a leitura.
            isPendingDespesa(despesa.situacao) ? "despesas-table-row--pending " : ""
          }rounded-sm bg-[var(--surface-elevated)] shadow-[var(--shadow-xs)] ring-1 ring-[var(--border-soft)] transition-all duration-[var(--motion-duration-fast)] hover:-translate-y-[1px] hover:bg-[var(--surface-subtle)] hover:shadow-[var(--shadow-sm)]`}
        >
          <td className="px-4 py-5 text-sm font-semibold text-[var(--secundary-1)]">
            {getDespesaCodigo(despesa)}
          </td>
          <td className="despesas-table-cell px-4 py-5 text-sm font-semibold text-[var(--foreground)]">
            {despesa.tipoCodigoNome}
          </td>
          <td className="px-4 py-5 text-sm font-semibold text-[var(--foreground)]">
            {despesa.raw.consumoPrevisto != null ? despesa.raw.consumoPrevisto : "-"}
          </td>
          <td className="px-4 py-5 text-sm font-semibold text-[var(--foreground)]">
            {despesa.categoria}
          </td>
          <td className="despesas-table-cell px-4 py-5 text-sm text-[var(--foreground-muted)]">
            {despesa.descricao}
          </td>
          <td className="despesas-table-cell px-4 py-5 text-sm font-semibold text-[var(--secundary-1)]">
            {despesa.valorFormatado}
          </td>
          <td className="despesas-table-cell px-4 py-5 text-sm text-[var(--foreground-muted)]">
            {despesa.dataFormatada}
          </td>
          <td className="despesas-table-cell px-4 py-5">
            <span
              className={`despesas-table-status-badge civitas-badge min-w-[84px] ${getStatusBadgeClassName(
                despesa.situacao
              )}`}
            >
              {despesa.situacaoLabel}
            </span>
          </td>
          <td className="despesas-table-cell px-4 py-5">
            <DocumentoAction despesa={despesa} />
          </td>
          <td className="despesas-table-cell rounded-sm px-4 py-5">
            <RowActions
              despesa={despesa}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onPayment={onPayment}
            />
          </td>
        </tr>
      ))}
    </>
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

      if (!resolvedDocumento?.digitalizacao) {
        showToast("Documento nao foi encontrado para abertura.", "error");
        return;
      }

      const fileType = resolvedDocumento.fileType || "application/pdf";
      const blob = base64ToBlob(resolvedDocumento.digitalizacao, fileType);
      const url = window.URL.createObjectURL(blob);
      const openedWindow = window.open(url, "_blank", "noopener,noreferrer");

      if (!openedWindow) {
        showToast("O navegador bloqueou a abertura do documento.", "error");
      }

      window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
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

function RowActions({
  despesa,
  onView,
  onEdit,
  onDelete,
  onPayment,
}: Omit<DespesasTabelaRowsProps, "loading" | "despesas" | "hasLocalListSearch"> & {
  despesa: DespesaDashboardRow;
}) {
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
        {/* Acao dedicada ao fluxo de pagamento */}
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
}

const base64ToBlob = (base64: string, fileType: string): Blob => {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: fileType });
};

const getEnterDelayStyle = (index: number): CSSProperties | undefined => {
  if (index >= 6) return undefined;
  return { ["--enter-delay" as string]: `${index * 45}ms` } as CSSProperties;
};
