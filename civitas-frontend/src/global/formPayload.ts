type FormPayload = object;

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

export const toTrimmedText = (value: unknown): string => {
  return toTrimmedString(value);
};

export const toNumberOrUndefined = (value: unknown): number | undefined => {
  return toOptionalNumber(value);
};

const padDateSegment = (value: number): string => {
  return String(value).padStart(2, "0");
};

export const normalizeDateInput = (value: unknown): string | undefined => {
  const normalizedValue = toTrimmedString(value);

  if (!normalizedValue) {
    return undefined;
  }

  const isoMatch = normalizedValue.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${year}-${month}-${day}`;
  }

  const brMatch = normalizedValue.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return `${year}-${month}-${day}`;
  }

  const parsedDate = new Date(normalizedValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return `${parsedDate.getFullYear()}-${padDateSegment(parsedDate.getMonth() + 1)}-${padDateSegment(parsedDate.getDate())}`;
};

const toDateTimestamp = (value: unknown): number => {
  const normalizedDate = normalizeDateInput(value);
  if (!normalizedDate) return Number.NaN;

  const [year, month, day] = normalizedDate.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
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
  const payload = data as Record<string, unknown>;

  return {
    ...data,
    nomeFantasia: toTrimmedString(payload.nomeFantasia),
    situacao: toOptionalNumber(payload.situacao),
    cnpj: digitsOnly(payload.cnpj),
    nome: toTrimmedString(payload.nome),
    logradouro: toTrimmedString(payload.logradouro),
    numero: toTrimmedString(payload.numero),
    bairro: toTrimmedString(payload.bairro),
    cep: digitsOnly(payload.cep),
    telefone: digitsOnly(payload.telefone),
    email: toTrimmedString(payload.email).toLowerCase(),
    cidade: toTrimmedString(payload.cidade),
    estado: normalizeUf(payload.estado),
  } as T;
};

export const normalizeSecretariaPayload = <T extends FormPayload>(data: T): T => {
  const payload = data as Record<string, unknown>;

  return {
    ...data,
    situacao: toOptionalNumber(payload.situacao),
    descricao: toTrimmedString(payload.descricao),
    cnpj: digitsOnly(payload.cnpj),
    nome: toTrimmedString(payload.nome),
    logradouro: toTrimmedString(payload.logradouro),
    numero: toTrimmedString(payload.numero),
    bairro: toTrimmedString(payload.bairro),
    cep: digitsOnly(payload.cep),
    nomeRazaoSocial: toTrimmedString(payload.nomeRazaoSocial),
    telefone: digitsOnly(payload.telefone),
    email: toTrimmedString(payload.email).toLowerCase(),
    cidade: toTrimmedString(payload.cidade),
    estado: normalizeUf(payload.estado),
  } as T;
};

export const normalizeInstituicaoPayload = <T extends FormPayload>(data: T): T => {
  const payload = data as Record<string, unknown>;

  return {
    ...data,
    cnpj: digitsOnly(payload.cnpj),
    nome: toTrimmedString(payload.nome),
    logradouro: toTrimmedString(payload.logradouro),
    numero: toTrimmedString(payload.numero),
    bairro: toTrimmedString(payload.bairro),
    cep: digitsOnly(payload.cep),
    nomeRazaoSocial: toTrimmedString(payload.nomeRazaoSocial),
    telefone: digitsOnly(payload.telefone),
    email: toTrimmedString(payload.email).toLowerCase(),
    cidade: toTrimmedString(payload.cidade),
    estado: normalizeUf(payload.estado),
    situacao: toOptionalNumber(payload.situacao),
    idTipoInstituicao: toOptionalNumber(payload.idTipoInstituicao),
    idSecretaria: toOptionalNumber(payload.idSecretaria),
  } as T;
};

export const normalizeOrcamentoPayload = <T extends FormPayload>(data: T): T => {
  const payload = data as Record<string, unknown>;

  return {
    ...data,
    anoOrcamento: toOptionalNumber(payload.anoOrcamento),
    valorOrcamento: toOptionalNumber(payload.valorOrcamento),
    idInstituicao: toOptionalNumber(payload.idInstituicao),
    idTipoDespesa: toOptionalNumber(payload.idTipoDespesa),
  } as T;
};

export const normalizeUsuarioPayload = <T extends FormPayload>(data: T): T => {
  const payload = data as Record<string, unknown>;

  return {
    ...data,
    cpf: digitsOnly(payload.cpf),
    nome: toTrimmedString(payload.nome),
    rg: toTrimmedString(payload.rg),
    logradouro: toTrimmedString(payload.logradouro),
    numero: toTrimmedString(payload.numero),
    matricula: toTrimmedString(payload.matricula),
    cidade: toTrimmedString(payload.cidade),
    estado: normalizeUf(payload.estado),
    cep: digitsOnly(payload.cep),
    bairro: toTrimmedString(payload.bairro),
    email: toTrimmedString(payload.email).toLowerCase(),
    senha: toTrimmedString(payload.senha),
    situacao: toOptionalNumber(payload.situacao),
    tipoUsuario: toOptionalNumber(payload.tipoUsuario),
  } as T;
};

export const validateRequiredUc = (
  value: unknown,
  requiresUc: boolean
): string | undefined => {
  if (!requiresUc) {
    return undefined;
  }

  if (!toTrimmedString(value)) {
    return "UC e obrigatoria para o tipo de despesa selecionado.";
  }

  return undefined;
};

export const validateDespesaDateRange = (
  dataEmicao: unknown,
  dataVencimento: unknown
): string | undefined => {
  const emissaoTimestamp = toDateTimestamp(dataEmicao);
  const vencimentoTimestamp = toDateTimestamp(dataVencimento);

  if (!Number.isNaN(emissaoTimestamp) && emissaoTimestamp > Date.now()) {
    return "Data de emissao nao pode ser futura.";
  }

  if (
    !Number.isNaN(emissaoTimestamp) &&
    !Number.isNaN(vencimentoTimestamp) &&
    vencimentoTimestamp < emissaoTimestamp
  ) {
    return "Data de vencimento nao pode ser anterior a data de emissao.";
  }

  return undefined;
};

export const normalizeDespesaPayload = <T extends FormPayload>(data: T): T => {
  const payload = data as Record<string, unknown>;
  const normalizedCodigo = toTrimmedString(payload.codigo);
  const normalizedDataEmissao = normalizeDateInput(
    payload.dataEmissao ?? payload.dataEmicao
  );
  const normalizedStatus = toOptionalNumber(payload.status ?? payload.situacao);

  return {
    ...data,
    numeroDocumento: digitsOnly(payload.numeroDocumento),
    codigo: normalizedCodigo,
    uc: toTrimmedString(payload.uc),
    dataEmissao: normalizedDataEmissao,
    dataEmicao: normalizedDataEmissao,
    consumoPrevisto: toOptionalNumber(payload.consumoPrevisto ?? payload.valor),
    dataVencimento: normalizeDateInput(payload.dataVencimento ?? payload.data),
    status: normalizedStatus,
    situacao: normalizedStatus,
    idTipoDespesa: toOptionalNumber(payload.idTipoDespesa),
    idOrcamento: toOptionalNumber(payload.idOrcamento),
    idInstituicao: toOptionalNumber(payload.idInstituicao),
    idFornecedor: toOptionalNumber(payload.idFornecedor ?? payload.fornecedorId),
    idUsuario: toOptionalNumber(payload.idUsuario),
    descricao: toTrimmedString(payload.descricao),
    valor: toOptionalNumber(payload.valor),
    data: normalizeDateInput(payload.data),
    categoria: toTrimmedString(payload.categoria),
  } as T;
};
