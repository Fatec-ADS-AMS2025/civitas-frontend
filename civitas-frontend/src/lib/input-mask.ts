export type InputMaskName = "cpf" | "cnpj" | "cpfCnpj" | "cep" | "phone" | "currency" | "integer" | "year";

type InputMode = "text" | "numeric" | "decimal" | "tel" | "email" | "search" | "url" | "none";

export type InputMaskDefinition = {
  format: (value: string) => string;
  parse?: (value: string) => string | number;
  inputMode?: InputMode;
  maxLength?: number;
};

export type InputMask = InputMaskName | InputMaskDefinition;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const toText = (value: unknown): string => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
};

const digitsOnly = (value: string): string => value.replace(/\D/g, "");

const limitDigits = (value: string, maxLength: number): string => {
  return digitsOnly(value).slice(0, maxLength);
};

const formatCpf = (value: string): string => {
  const digits = limitDigits(value, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatCnpj = (value: string): string => {
  const digits = limitDigits(value, 14);

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

const formatCep = (value: string): string => {
  const digits = limitDigits(value, 8);

  if (digits.length <= 5) return digits;

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const formatPhone = (value: string): string => {
  const digits = limitDigits(value, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatInteger = (value: string, maxLength?: number): string => {
  const digits = digitsOnly(value);
  return maxLength ? digits.slice(0, maxLength) : digits;
};

const formatCurrencyFromDigits = (digits: string): string => {
  if (!digits) {
    return "";
  }

  const numericValue = Number(digits) / 100;
  return currencyFormatter.format(numericValue);
};

const formatCurrency = (value: string): string => {
  return formatCurrencyFromDigits(digitsOnly(value));
};

const parseDigits = (value: string, maxLength?: number): string => {
  const digits = digitsOnly(value);
  return maxLength ? digits.slice(0, maxLength) : digits;
};

const parseCurrency = (value: string): number | "" => {
  const digits = digitsOnly(value);

  if (!digits) {
    return "";
  }

  return Number(digits) / 100;
};

const INPUT_MASKS: Record<InputMaskName, InputMaskDefinition> = {
  cpf: {
    format: formatCpf,
    parse: (value) => parseDigits(value, 11),
    inputMode: "numeric",
    maxLength: 14,
  },
  cnpj: {
    format: formatCnpj,
    parse: (value) => parseDigits(value, 14),
    inputMode: "numeric",
    maxLength: 18,
  },
  cpfCnpj: {
    format: (value) => {
      const digits = digitsOnly(value);
      return digits.length > 11 ? formatCnpj(digits) : formatCpf(digits);
    },
    parse: (value) => parseDigits(value, 14),
    inputMode: "numeric",
    maxLength: 18,
  },
  cep: {
    format: formatCep,
    parse: (value) => parseDigits(value, 8),
    inputMode: "numeric",
    maxLength: 9,
  },
  phone: {
    format: formatPhone,
    parse: (value) => parseDigits(value, 11),
    inputMode: "tel",
    maxLength: 15,
  },
  currency: {
    format: formatCurrency,
    parse: parseCurrency,
    inputMode: "decimal",
  },
  integer: {
    format: (value) => formatInteger(value),
    parse: (value) => parseDigits(value),
    inputMode: "numeric",
  },
  year: {
    format: (value) => formatInteger(value, 4),
    parse: (value) => parseDigits(value, 4),
    inputMode: "numeric",
    maxLength: 4,
  },
};

export const resolveInputMask = (mask?: InputMask | null): InputMaskDefinition | undefined => {
  if (!mask) {
    return undefined;
  }

  if (typeof mask === "string") {
    return INPUT_MASKS[mask];
  }

  return mask;
};

export const formatMaskedValue = (mask: InputMask, value: unknown): string => {
  const resolvedMask = resolveInputMask(mask);
  const textValue = toText(value);

  if (!resolvedMask || textValue.length === 0) {
    return textValue;
  }

  if (mask === "currency" && typeof value === "number") {
    return currencyFormatter.format(value);
  }

  return resolvedMask.format(textValue);
};

export const normalizeMaskedValue = (mask: InputMask, value: unknown): unknown => {
  const resolvedMask = resolveInputMask(mask);
  const textValue = toText(value);

  if (!resolvedMask || textValue.length === 0) {
    return textValue;
  }

  return resolvedMask.parse ? resolvedMask.parse(textValue) : textValue;
};
