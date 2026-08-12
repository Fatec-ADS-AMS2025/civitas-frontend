"use client";

import { useState } from "react";
import { despesaService } from "@/hooks/despesa";
import { documentoService } from "@/hooks/documento";
import { showToast } from "@/hooks/useToast";
import {
  base64ToDocumentBlob,
  downloadDocumentBlob,
  getDocumentFileName,
  openDocumentBlob,
  openDocumentWindow,
} from "@/lib/documento-utils";
import type { DespesaDashboardRow } from "@/hooks/useDespesasDashboard";

type DespesaDocumentoActionsProps = {
  despesa: DespesaDashboardRow;
  showEmptyState?: boolean;
};

export default function DespesaDocumentoActions({
  despesa,
  showEmptyState = false,
}: DespesaDocumentoActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const documento = despesa.documento;

  if (!despesa.documentoConfiavel) {
    return showEmptyState ? (
      <span className="inline-flex min-h-9 items-center rounded-sm border border-dashed border-[var(--border-soft)] px-3 text-xs font-semibold text-[var(--foreground-muted)]">
        Sem anexo
      </span>
    ) : null;
  }

  const getDocumentoBlob = async (): Promise<Blob | null> => {
    const resolvedDocumento =
      documento?.digitalizacao
        ? documento
        : despesa.idDocumento
          ? await documentoService.getDocumentoDataById(despesa.idDocumento)
          : null;

    if (resolvedDocumento?.digitalizacao) {
      return base64ToDocumentBlob(
        resolvedDocumento.digitalizacao,
        resolvedDocumento.fileType,
        resolvedDocumento.fileName
      );
    }

    if (despesa.raw.hashDocumento) {
      return despesaService.getDocumentoBlobByHash(despesa.raw.hashDocumento);
    }

    return null;
  };

  const getFileName = (): string =>
    getDocumentFileName(
      documento?.fileName ?? despesa.raw.nomeDocumento,
      `documento-${despesa.id}`
    );

  const handleOpen = async () => {
    // Abrir a janela ainda no gesto do usuario evita que o navegador bloqueie o resultado do fetch.
    // O opener e removido imediatamente para evitar acesso da nova guia a janela de origem.
    const documentWindow = openDocumentWindow();

    try {
      setIsLoading(true);
      const blob = await getDocumentoBlob();

      if (!blob) {
        documentWindow?.close();
        showToast("Documento nao foi encontrado para abertura.", "error");
        return;
      }

      if (!openDocumentBlob(blob, documentWindow)) {
        downloadDocumentBlob(blob, getFileName());
        showToast("A abertura foi bloqueada pelo navegador. O download foi iniciado.", "info");
      }
    } catch (error) {
      documentWindow?.close();
      console.error("Erro ao abrir documento da despesa.", error);
      showToast("Nao foi possivel abrir o documento.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const blob = await getDocumentoBlob();
      if (!blob) {
        showToast("Documento nao foi encontrado para download.", "error");
        return;
      }

      downloadDocumentBlob(blob, getFileName());
    } catch (error) {
      console.error("Erro ao baixar documento da despesa.", error);
      showToast("Nao foi possivel baixar o documento.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={() => void handleOpen()}
        disabled={isLoading}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)] disabled:cursor-wait disabled:opacity-70"
        aria-label={`Abrir documento da despesa ${despesa.registro}`}
      >
        <span className="material-symbols-outlined !text-[16px]" aria-hidden="true">
          {isLoading ? "progress_activity" : "visibility"}
        </span>
        {isLoading ? "Carregando..." : "Abrir"}
      </button>
      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={isLoading}
        className="inline-flex min-h-9 items-center gap-1 rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-2 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)] disabled:cursor-wait disabled:opacity-70"
        aria-label={`Baixar documento da despesa ${despesa.registro}`}
      >
        <span className="material-symbols-outlined !text-[16px]" aria-hidden="true">
          download
        </span>
        Baixar
      </button>
    </div>
  );
}
