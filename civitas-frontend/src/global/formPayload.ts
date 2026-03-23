type FormPayload = Record<string, unknown>;

type SimpleValidator = (value: unknown) => string | undefined;

const toTrimmedString = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const toOptionalNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "number") {
    return value;
  }

  const parsedValue = Number(toTrimmedString(value));
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
};

export const digitsOnly = (value: unknown): string => {
  return toTrimmedString(value).replace(/\D/g, "");
};

export const normalizeUf = (value: unknown): string => {
  return toTrimmedString(value).toUpperCase();
};

export const composeValidators =
  (...validators: SimpleValidator[]) =>
  (value: unknown): string | undefined => {
    for (const validator of validators) {
      const message = validator(value);
      if (message) {
        return message;
      }
    }

    return undefined;
  };

export const validateDigitsLength =
  (label: string, expectedLength: number): SimpleValidator =>
  (value: unknown) => {
    const digits = digitsOnly(value);

    if (!digits) {
      return undefined;
    }

    if (digits.length !== expectedLength) {
      return `${label} deve ter ${expectedLength} digitos.`;
    }

    return undefined;
  };

export const validateMaxLength =
  (label: string, maxLength: number): SimpleValidator =>
  (value: unknown) => {
    const normalizedValue = toTrimmedString(value);

    if (!normalizedValue) {
      return undefined;
    }

    if (normalizedValue.length > maxLength) {
      return `${label} deve ter no maximo ${maxLength} caracteres.`;
    }

    return undefined;
  };

export const validateUfCode =
  (label = "Estado"): SimpleValidator =>
  (value: unknown) => {
    const uf = normalizeUf(value);

    if (!uf) {
      return undefined;
    }

    if (!/^[A-Z]{2}$/.test(uf)) {
      return `${label} deve conter a UF com 2 letras.`;
    }

    return undefined;
  };

export const normalizeFornecedorPayload = <T extends FormPayload>(data: T): T => {
  return {
    ...data,
    nomeFantasia: toTrimmedString(data.nomeFantasia),
    situacao: toOptionalNumber(data.situacao),
    cnpj: digitsOnly(data.cnpj),
    nome: toTrimmedString(data.nome),
    logradouro: toTrimmedString(data.logradouro),
    numero: toTrimmedString(data.numero),
    bairro: toTrimmedString(data.bairro),
    cep: digitsOnly(data.cep),
    telefone: digitsOnly(data.telefone),
    email: toTrimmedString(data.email).toLowerCase(),
    cidade: toTrimmedString(data.cidade),
    estado: normalizeUf(data.estado),
  } as T;
};

export const normalizeSecretariaPayload = <T extends FormPayload>(data: T): T => {
  return {
    ...data,
    situacao: toOptionalNumber(data.situacao),
    descricao: toTrimmedString(data.descricao),
    cnpj: digitsOnly(data.cnpj),
    nome: toTrimmedString(data.nome),
    logradouro: toTrimmedString(data.logradouro),
    numero: toTrimmedString(data.numero),
    bairro: toTrimmedString(data.bairro),
    cep: digitsOnly(data.cep),
    nomeRazaoSocial: toTrimmedString(data.nomeRazaoSocial),
    telefone: digitsOnly(data.telefone),
    email: toTrimmedString(data.email).toLowerCase(),
    cidade: toTrimmedString(data.cidade),
    estado: normalizeUf(data.estado),
  } as T;
};

export const normalizeInstituicaoPayload = <T extends FormPayload>(data: T): T => {
  return {
    ...data,
    cnpj: digitsOnly(data.cnpj),
    nome: toTrimmedString(data.nome),
    logradouro: toTrimmedString(data.logradouro),
    numero: toTrimmedString(data.numero),
    bairro: toTrimmedString(data.bairro),
    cep: digitsOnly(data.cep),
    nomeRazaoSocial: toTrimmedString(data.nomeRazaoSocial),
    telefone: digitsOnly(data.telefone),
    email: toTrimmedString(data.email).toLowerCase(),
    cidade: toTrimmedString(data.cidade),
    estado: normalizeUf(data.estado),
    situacao: toOptionalNumber(data.situacao),
    idTipoInstituicao: toOptionalNumber(data.idTipoInstituicao),
    idSecretaria: toOptionalNumber(data.idSecretaria),
  } as T;
};

export const normalizeOrcamentoPayload = <T extends FormPayload>(data: T): T => {
  return {
    ...data,
    anoOrcamento: toOptionalNumber(data.anoOrcamento),
    valorOrcamento: toOptionalNumber(data.valorOrcamento),
    idInstituicao: toOptionalNumber(data.idInstituicao),
    idTipoDespesa: toOptionalNumber(data.idTipoDespesa),
  } as T;
};
