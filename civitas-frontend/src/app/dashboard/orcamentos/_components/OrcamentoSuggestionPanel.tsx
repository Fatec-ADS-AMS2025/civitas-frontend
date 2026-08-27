"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormExtraContentRenderArgs } from "@/components/Form/form";
import { orcamentoService } from "@/hooks/orcamento";
import type OrcamentoDTO from "@/models/orcamento";
import { calculateOrcamentoSuggestion, type OrcamentoSuggestionResult } from "../orcamento-suggestion";

type SuggestionUiStatus = "idle" | "loading" | "available" | "empty" | "error" | "accepted" | "ignored";

type OrcamentoSuggestionPanelProps = Pick<FormExtraContentRenderArgs, "formData" | "setFieldValue">;

const MONTHLY_FIELD_KEYS = [
  "valorJaneiro",
  "valorFevereiro",
  "valorMarco",
  "valorAbril",
  "valorMaio",
  "valorJunho",
  "valorJulho",
  "valorAgosto",
  "valorSetembro",
  "valorOutubro",
  "valorNovembro",
  "valorDezembro",
] as const;

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const numericValue = Number(value.replace(/\s/g, "").replace("R$", "").replace(/\./g, "").replace(",", "."));

  return Number.isFinite(numericValue) ? numericValue : 0;
};

const roundCurrency = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export default function OrcamentoSuggestionPanel({ formData, setFieldValue }: OrcamentoSuggestionPanelProps) {
  const idInstituicao = formData.idInstituicao;
  const idTipoDespesa = formData.idTipoDespesa;
  const isMonthly = formData.tipoCadastroOrcamento === "mensal";
  const [status, setStatus] = useState<SuggestionUiStatus>("idle");
  const [suggestion, setSuggestion] = useState<OrcamentoSuggestionResult>({
    status: "idle",
    count: 0,
  });
  const orcamentosCacheRef = useRef<OrcamentoDTO[] | null>(null);
  const orcamentosRequestRef = useRef<Promise<OrcamentoDTO[]> | null>(null);

  const suggestedValue = suggestion.averageValue;
  const suggestedValueLabel = useMemo(
    () => (suggestedValue !== undefined ? formatCurrency(suggestedValue) : ""),
    [suggestedValue],
  );

  useEffect(() => {
    if (!isMonthly) return;

    const monthlyTotal = roundCurrency(MONTHLY_FIELD_KEYS.reduce((total, key) => total + toNumber(formData[key]), 0));
    const currentTotal = roundCurrency(toNumber(formData.valorOrcamento));

    if (monthlyTotal !== currentTotal) {
      setFieldValue("valorOrcamento", monthlyTotal > 0 ? monthlyTotal : "");
    }
  }, [formData, isMonthly, setFieldValue]);

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
        let orcamentos = orcamentosCacheRef.current;

        if (!orcamentos) {
          const request =
            orcamentosRequestRef.current ??
            orcamentoService
              .getAll()
              .then((orcamentos) => {
                orcamentosCacheRef.current = orcamentos;
                return orcamentos;
              })
              .finally(() => {
                orcamentosRequestRef.current = null;
              });

          orcamentosRequestRef.current = request;
          orcamentos = await request;
        }

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

    if (isMonthly) {
      const baseMonthlyValue = Math.floor((suggestedValue / MONTHLY_FIELD_KEYS.length) * 100) / 100;
      const distributedTotal = baseMonthlyValue * MONTHLY_FIELD_KEYS.length;
      const remainder = roundCurrency(suggestedValue - distributedTotal);

      MONTHLY_FIELD_KEYS.forEach((key, index) => {
        setFieldValue(key, roundCurrency(baseMonthlyValue + (index === MONTHLY_FIELD_KEYS.length - 1 ? remainder : 0)));
      });
    } else {
      setFieldValue("valorOrcamento", suggestedValue);
    }

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
        Encontramos um valor sugerido de {suggestedValueLabel} com base em {suggestion.count} orcamento
        {suggestion.count === 1 ? "" : "s"} anterior{suggestion.count === 1 ? "" : "es"}.
      </p>
      <p className="mt-1 text-sm text-[var(--foreground-muted)]">Deseja usar esse valor?</p>

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
