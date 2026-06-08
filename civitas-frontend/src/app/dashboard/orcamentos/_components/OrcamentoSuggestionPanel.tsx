"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { FormExtraContentRenderArgs } from "@/components/Form/form";
import { orcamentoService } from "@/hooks/orcamento";
import {
  calculateOrcamentoSuggestion,
  type OrcamentoSuggestionResult,
} from "../orcamento-suggestion";

type SuggestionUiStatus =
  | "idle"
  | "loading"
  | "available"
  | "empty"
  | "error"
  | "accepted"
  | "ignored";

type OrcamentoSuggestionPanelProps = Pick<
  FormExtraContentRenderArgs,
  "formData" | "setFieldValue"
>;

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export default function OrcamentoSuggestionPanel({
  formData,
  setFieldValue,
}: OrcamentoSuggestionPanelProps) {
  const idInstituicao = formData.idInstituicao;
  const idTipoDespesa = formData.idTipoDespesa;
  const [status, setStatus] = useState<SuggestionUiStatus>("idle");
  const [suggestion, setSuggestion] = useState<OrcamentoSuggestionResult>({
    status: "idle",
    count: 0,
  });

  const suggestedValue = suggestion.averageValue;
  const suggestedValueLabel = useMemo(
    () => (suggestedValue !== undefined ? formatCurrency(suggestedValue) : ""),
    [suggestedValue]
  );

  useEffect(() => {
    if (!idInstituicao || !idTipoDespesa) {
      setStatus("idle");
      setSuggestion({ status: "idle", count: 0 });
      return;
    }

    let isActive = true;

    const loadSuggestion = async () => {
      setStatus("loading");

      try {
        const orcamentos = await orcamentoService.getAll();
        if (!isActive) return;

        const nextSuggestion = calculateOrcamentoSuggestion(orcamentos, {
          idInstituicao,
          idTipoDespesa,
        });

        setSuggestion(nextSuggestion);
        setStatus(nextSuggestion.status === "available" ? "available" : "empty");
      } catch (error) {
        if (!isActive) return;

        console.error("Erro ao buscar sugestao de orcamento:", error);
        setSuggestion({ status: "empty", count: 0 });
        setStatus("error");
      }
    };

    void loadSuggestion();

    return () => {
      isActive = false;
    };
  }, [idInstituicao, idTipoDespesa]);

  const applySuggestion = () => {
    if (suggestedValue === undefined) return;

    setFieldValue("valorOrcamento", suggestedValue);
    setStatus("accepted");
  };

  const ignoreSuggestion = () => {
    setStatus("ignored");
  };

  if (status === "idle") {
    return (
      <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--foreground-soft)]">
        Selecione instituicao e tipo de despesa para consultar uma sugestao de valor.
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div
        className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]"
        aria-live="polite"
      >
        Buscando orcamentos anteriores similares...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className="rounded-sm border border-[var(--tone-danger-border)] bg-[var(--tone-danger-bg)] px-4 py-3 text-sm text-[var(--tone-danger-text)]"
        aria-live="polite"
      >
        Nao foi possivel buscar uma sugestao agora. Voce pode preencher o valor manualmente.
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div
        className="rounded-sm border border-[var(--tone-amber-border)] bg-[var(--tone-amber-bg)] px-4 py-3 text-sm text-[var(--tone-amber-text)]"
        aria-live="polite"
      >
        Nao ha sugestao disponivel para esta instituicao e tipo. Preencha o valor manualmente.
      </div>
    );
  }

  if (status === "accepted") {
    return (
      <div
        className="rounded-sm border border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] px-4 py-3 text-sm text-[var(--tone-success-text)]"
        aria-live="polite"
      >
        Valor sugerido aplicado. O campo continua editavel se precisar ajustar.
      </div>
    );
  }

  if (status === "ignored") {
    return (
      <div
        className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--foreground-muted)]"
        aria-live="polite"
      >
        Sugestao ignorada. Preencha o valor manualmente.
      </div>
    );
  }

  return (
    <div
      className="rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] p-4"
      aria-live="polite"
    >
      <p className="text-sm font-semibold text-[var(--foreground)]">
        Encontramos um valor sugerido de {suggestedValueLabel} com base em {suggestion.count}{" "}
        orcamento{suggestion.count === 1 ? "" : "s"} anterior{suggestion.count === 1 ? "" : "es"}.
      </p>
      <p className="mt-1 text-sm text-[var(--foreground-muted)]">
        Deseja usar esse valor?
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={applySuggestion}
          className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-[var(--secundary-1)] bg-[var(--secundary-1)] px-4 py-2.5 text-sm font-semibold text-[var(--text-on-brand)] transition hover:bg-[color-mix(in_srgb,var(--secundary-1)_92%,black_8%)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] sm:w-auto"
        >
          Usar valor sugerido
        </button>
        <button
          type="button"
          onClick={ignoreSuggestion}
          className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] sm:w-auto"
        >
          Ignorar
        </button>
      </div>
    </div>
  );
}
