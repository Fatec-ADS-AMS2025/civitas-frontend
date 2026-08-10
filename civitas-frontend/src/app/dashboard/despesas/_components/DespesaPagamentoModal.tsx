"use client";

import type React from "react";
import { useMemo, useState } from "react";
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
  unidadeMedidaNome?: string;
  onClose: () => void;
  onConfirm: (values: PaymentValues) => Promise<void> | void;
};

const buildInitialValues = (): PaymentValues => ({
  valorPago: "",
  consumoReal: "",
  documento: "",
});

const validatePositive = (value: number | "", label: string): string | undefined => {
  const numericValue = Number(value);
  if (value === "" || !Number.isFinite(numericValue)) return `${label} e obrigatorio.`;
  if (numericValue <= 0) return `${label} deve ser maior que zero.`;
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
  unidadeMedidaNome,
  onClose,
  onConfirm,
}: DespesaPagamentoModalProps) {
  const [values, setValues] = useState<PaymentValues>(buildInitialValues);
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
    [],
  );

  if (!open || !despesa) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: PaymentErrors = {};
    const resolvedValorPago = touched.valorPago
      ? values.valorPago === ""
        ? ""
        : Number(values.valorPago)
      : Number(despesa.raw.valorPago);
    const resolvedConsumoReal = touched.consumoReal
      ? values.consumoReal === ""
        ? ""
        : Number(values.consumoReal)
      : Number(despesa.raw.consumoReal);
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

  if (isDespesaPaid(despesa)) {
    return (
      <Modal value={open} setValue={onClose}>
        <div className="flex h-full flex-col gap-6">
          <header className="rounded-sm border border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-sm bg-[var(--surface-elevated)] text-[var(--tone-success-text)]">
                <span className="material-symbols-outlined !text-[28px]">verified</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--tone-success-text)]">
                  Pagamento de despesa
                </p>
                <h3 className="mt-1.5 text-2xl font-semibold text-[var(--foreground)]">Esta despesa ja esta paga</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                  O registro {despesa.registro} ja possui baixa de pagamento. Para alterar dados financeiros, use a
                  edicao da despesa.
                </p>
              </div>
            </div>
          </header>

          <div className="grid gap-3 sm:grid-cols-2">
            <PaymentInfoCard label="Registro" value={despesa.registro} />
            <PaymentInfoCard label="Data do pagamento" value={formatPaymentDate(despesa.raw.dataPagamento)} />
            <PaymentInfoCard label="Valor pago" value={formatPaymentCurrency(despesa.raw.valorPago)} />
            <PaymentInfoCard
              label={`Consumo real em ${unidadeMedidaNome || "unidade"}`}
              value={formatPaymentNumber(despesa.raw.consumoReal)}
            />
          </div>

          <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">{despesa.descricao}</p>
            <p className="mt-1 text-xs text-[var(--foreground-soft)]">
              Documento: {despesa.numeroDocumento || "Nao informado"}
            </p>
          </div>

          <div className="flex justify-end border-t border-[var(--divider)] pt-4">
            <Button variant="tertiary" type="button" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal value={open} setValue={onClose}>
      <form className="flex h-full flex-col" onSubmit={handleSubmit}>
        <header className="flex-shrink-0 border-b border-[var(--border-soft)] pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
            Pagamento de despesa
          </p>
          <h3 className="mt-1.5 text-2xl font-semibold text-[var(--secundary-1)]">Pagar despesa {despesa.registro}</h3>
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
              label={`Consumo real em ${unidadeMedidaNome || "unidade"}`}
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

function PaymentInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4">
      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--foreground-soft)]">{label}</span>
      <strong className="mt-2 block text-lg text-[var(--foreground)]">{value}</strong>
    </div>
  );
}

const isDespesaPaid = (despesa: DespesaDashboardRow): boolean => {
  return Number(despesa.raw.status ?? despesa.raw.situacao ?? despesa.situacao) === 2;
};

const formatPaymentCurrency = (value: unknown): string => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return "Nao informado";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue);
};

const formatPaymentNumber = (value: unknown): string => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return "Nao informado";

  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(numericValue);
};

const formatPaymentDate = (value?: string): string => {
  if (!value) return "Nao informada";

  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
};
