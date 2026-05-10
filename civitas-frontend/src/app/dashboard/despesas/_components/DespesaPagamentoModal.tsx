"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/button";
import DocumentoField, { type DocumentoFieldValue } from "@/components/Form/documento-field";
import type { FormFieldConfig } from "@/components/Form/form";
import Input from "@/components/Input";
import Modal from "@/components/modal";
import type { DespesaDashboardRow } from "@/hooks/useDespesasDashboard";

type PaymentValues = {
  valorPago: number | "";
  consumoReal: number | "";
  documento: DocumentoFieldValue | "";
};

type PaymentErrors = {
  valorPago?: string;
  consumoReal?: string;
  documento?: string;
};

type PaymentTouched = {
  valorPago: boolean;
  consumoReal: boolean;
};

type DespesaPagamentoModalProps = {
  open: boolean;
  despesa: DespesaDashboardRow | null;
  onClose: () => void;
  onConfirm: (values: PaymentValues) => Promise<void> | void;
};

const toNumberOrEmpty = (value: unknown): number | "" => {
  if (value === "" || value === undefined || value === null) return "";
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : "";
};

// Modal de pagamento usa apenas valores pagos + comprovante; status e tratado no submit.
const buildInitialValues = (despesa: DespesaDashboardRow | null): PaymentValues => {
  return {
    valorPago: toNumberOrEmpty(despesa?.raw.valorPago ?? 0),
    consumoReal: toNumberOrEmpty(despesa?.raw.consumoReal ?? 0),
    documento: "",
  };
};

const validatePositive = (value: number | "", label: string): string | undefined => {
  if (value === "") return `${label} e obrigatorio.`;
  if (Number(value) <= 0) return `${label} deve ser maior que zero.`;
  return undefined;
};

// DocumentoField retorna um objeto rico; aceite apenas payloads base64 validos.
const resolveDocumentoValue = (value: unknown): DocumentoFieldValue | null => {
  if (!value || typeof value !== "object") return null;

  const documento = value as DocumentoFieldValue;
  if (!documento.digitalizacao || documento.digitalizacao.trim().length === 0) {
    return null;
  }

  return documento;
};

export default function DespesaPagamentoModal({
  open,
  despesa,
  onClose,
  onConfirm,
}: DespesaPagamentoModalProps) {
  const [values, setValues] = useState<PaymentValues>(() => buildInitialValues(despesa));
  const [errors, setErrors] = useState<PaymentErrors>({});
  const [touched, setTouched] = useState<PaymentTouched>({
    valorPago: false,
    consumoReal: false,
  });
  const documentoField: FormFieldConfig = useMemo(
    () => ({
      key: "documento",
      label: "Comprovante",
      type: "documento",
      accept: ".pdf,.png,.jpg,.jpeg,image/*,application/pdf",
    }),
    []
  );

  useEffect(() => {
    if (!open) return;
    setValues(buildInitialValues(despesa));
    setErrors({});
    setTouched({ valorPago: false, consumoReal: false });
  }, [despesa, open]);

  if (!open || !despesa) return null;

  // Garante validacao do pagamento antes de disparar o update.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: PaymentErrors = {};
    const currentValorPago = despesa.raw.valorPago ?? 0;
    const currentConsumoReal = despesa.raw.consumoReal ?? 0;
    const resolvedValorPago = touched.valorPago
      ? values.valorPago === "" ? "" : Number(values.valorPago)
      : Number(currentValorPago);
    const resolvedConsumoReal = touched.consumoReal
      ? values.consumoReal === "" ? "" : Number(values.consumoReal)
      : Number(currentConsumoReal);
    const documentoValue = resolveDocumentoValue(values.documento);

    const valorPagoError = validatePositive(resolvedValorPago, "Valor pago");
    if (valorPagoError) nextErrors.valorPago = valorPagoError;

    const consumoRealError = validatePositive(resolvedConsumoReal, "Consumo real");
    if (consumoRealError) nextErrors.consumoReal = consumoRealError;

    if (!documentoValue) {
      nextErrors.documento = "Anexe o comprovante de pagamento.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await onConfirm({
      valorPago: Number(resolvedValorPago),
      consumoReal: Number(resolvedConsumoReal),
      documento: documentoValue ?? "",
    });
  };

  return (
    <Modal value={open} setValue={onClose}>
      <form className="flex h-full flex-col" onSubmit={handleSubmit}>
        <header className="flex-shrink-0 border-b border-[var(--border-soft)] pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
            Pagamento de despesa
          </p>
          <h3 className="mt-1.5 text-2xl font-semibold text-[var(--secundary-1)]">
            Pagar despesa {despesa.registro}
          </h3>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Informe valor pago, consumo real e anexe o comprovante.
          </p>
        </header>

        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Valor pago"
              placeholder="0,00"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={values.valorPago}
              error={errors.valorPago}
              onChange={(event) => {
                setTouched((current) => ({
                  ...current,
                  valorPago: true,
                }));
                setValues((current) => ({
                  ...current,
                  valorPago: event.target.value === "" ? "" : Number(event.target.value),
                }));
              }}
            />
            <Input
              label="Consumo real"
              placeholder="0"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={values.consumoReal}
              error={errors.consumoReal}
              onChange={(event) => {
                setTouched((current) => ({
                  ...current,
                  consumoReal: true,
                }));
                setValues((current) => ({
                  ...current,
                  consumoReal: event.target.value === "" ? "" : Number(event.target.value),
                }));
              }}
            />
            <div className="sm:col-span-2">
              <DocumentoField
                field={documentoField}
                value={values.documento}
                error={errors.documento}
                onChange={(field, value) =>
                  setValues((current) => ({
                    ...current,
                    [field.key]: value as DocumentoFieldValue | "",
                  }))
                }
                disabled={false}
                required={true}
                label="Comprovante"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center justify-end gap-2 border-t border-[var(--divider)] bg-[var(--surface-subtle)] pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Atualizar</Button>
        </div>
      </form>
    </Modal>
  );
}
