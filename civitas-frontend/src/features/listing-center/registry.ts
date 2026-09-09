import { getSituacaoLabel, SITUACAO_ATIVO, SITUACAO_INATIVO } from "@/global/situacao";
import { filterActiveRecords } from "@/global/softDelete";
import { despesaService } from "@/hooks/despesa";
import { fornecedorService } from "@/hooks/fornecedor";
import { instituicaoService } from "@/hooks/instituicao";
import { orcamentoService } from "@/hooks/orcamento";
import { secretariaService } from "@/hooks/secretaria";
import { tipoDespesaService } from "@/hooks/tipoDespesa";
import { tipoInstituicaoService } from "@/hooks/tipoInstituicao";
import { usuarioService } from "@/hooks/usuario";
import type DespesaDTO from "@/models/despesa";
import type FornecedorDTO from "@/models/fornecedor";
import type OrcamentoDTO from "@/models/orcamento";
import type SecretariaDTO from "@/models/secretaria";
import type UsuarioDTO from "@/models/usuario";
import type { ListingConfig, ListingPageResult, ListingRegistry } from "./types";

type ListingRow = Record<string, unknown>;

type UsuarioRow = ListingRow & {
  id: number;
  nome: string;
  cpf: string;
  matricula: string;
  cidade: string;
  estado: string;
  email: string;
  tipoUsuarioLabel: string;
  situacaoLabel: string;
};

type FornecedorRow = ListingRow & {
  idFornecedor: number;
  nomeFantasia: string;
  nome: string;
  cnpj: string;
  telefone: string;
  cidade: string;
  estado: string;
  situacaoLabel: string;
};

type SecretariaRow = ListingRow & {
  idSecretaria: number;
  nome: string;
  descricao: string;
  cnpj: string;
  cidade: string;
  estado: string;
  situacaoLabel: string;
};

type InstituicaoRow = ListingRow & {
  id: number;
  nome: string;
  cnpj: string;
  cidade: string;
  estado: string;
  secretariaLabel: string;
  tipoInstituicaoLabel: string;
  situacaoLabel: string;
};

type OrcamentoRow = ListingRow & {
  idOrcamento: number;
  ano: number;
  valor: number;
  instituicaoLabel: string;
  tipoDespesaLabel: string;
  situacaoLabel: string;
};

type DespesaRow = ListingRow & {
  id: number;
  numeroDocumento: string;
  dataEmissao: string;
  dataVencimento: string;
  consumoPrevisto: number;
  fornecedorLabel: string;
  tipoDespesaLabel: string;
  situacaoLabel: string;
};

const DEFAULT_PAGE_SIZES = [10, 20, 50];
const LISTING_FETCH_SIZE = 5000;
const SERVER_EXPORT_PAGE_SIZE = 500;
const SERVER_EXPORT_PAGE_BATCH_SIZE = 3;

const TIPO_USUARIO_OPTIONS = new Map<number, string>([
  [1, "Visitante"],
  [2, "Administrador"],
  [3, "Funcionario"],
]);

const SITUACAO_FILTER_OPTIONS = [
  { label: getSituacaoLabel(SITUACAO_ATIVO), value: getSituacaoLabel(SITUACAO_ATIVO) },
  { label: getSituacaoLabel(SITUACAO_INATIVO), value: getSituacaoLabel(SITUACAO_INATIVO) },
];

const toOptionalNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const getListingSituacaoLabel = (value: unknown) => getSituacaoLabel(toOptionalNumber(value));

const normalizeIdentifierPart = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "number" && (!Number.isFinite(value) || value <= 0)) return "";

  const text = String(value).trim();
  if (!text || text === "undefined" || text === "null") return "";

  return text;
};

const pickRowIdentifier = (...values: unknown[]) => {
  for (const value of values) {
    const text = normalizeIdentifierPart(value);
    if (!text) continue;
    return text;
  }

  return "";
};

const combineRowIdentifier = (...values: unknown[]) => values.map(normalizeIdentifierPart).filter(Boolean).join("-");

const buildClientPageResult = <T extends ListingRow>(
  rows: T[],
  page: number,
  pageSize: number,
): ListingPageResult<T> => {
  const totalRecords = rows.length;
  const totalPages = totalRecords === 0 ? 0 : Math.ceil(totalRecords / pageSize);
  const resolvedPage = totalPages === 0 ? 1 : Math.min(page, totalPages);
  const start = (resolvedPage - 1) * pageSize;
  const end = start + pageSize;

  return {
    rows: rows.slice(start, end),
    allRows: rows,
    totalRecords,
    totalPages,
    currentPage: resolvedPage,
    pageSize,
  };
};

const buildLookupLabel = (label: string, situacao?: number) =>
  toOptionalNumber(situacao) === SITUACAO_INATIVO ? `${label} (${getSituacaoLabel(SITUACAO_INATIVO)})` : label;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatDate = (value: unknown) => {
  const text = String(value ?? "").trim();
  if (!text) return "-";

  const [datePart] = text.split("T");
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return text;

  return `${match[3]}/${match[2]}/${match[1]}`;
};

const mapUsuarioRow = (usuario: UsuarioDTO): UsuarioRow => ({
  id: usuario.id,
  nome: usuario.nome,
  cpf: usuario.cpf,
  matricula: usuario.matricula,
  cidade: usuario.cidade,
  estado: usuario.estado,
  email: usuario.email,
  tipoUsuarioLabel: TIPO_USUARIO_OPTIONS.get(usuario.tipoUsuario) ?? "Visitante",
  situacaoLabel: getListingSituacaoLabel(usuario.situacao),
});

const mapFornecedorRow = (fornecedor: FornecedorDTO): FornecedorRow => ({
  idFornecedor: fornecedor.idFornecedor,
  nomeFantasia: fornecedor.nomeFantasia,
  nome: fornecedor.nome,
  cnpj: fornecedor.cnpj,
  telefone: fornecedor.telefone,
  cidade: fornecedor.cidade,
  estado: fornecedor.estado,
  situacaoLabel: getListingSituacaoLabel(fornecedor.situacao),
});

const loadUsuarioRows = async () => {
  const usuarios = await usuarioService.getAllData({ page: 1, size: LISTING_FETCH_SIZE });
  return usuarios.map(mapUsuarioRow);
};

const loadUsuarioPage: ListingConfig<UsuarioRow>["loadPage"] = async ({ page, pageSize }) => {
  const rows = await loadUsuarioRows();
  return buildClientPageResult(rows, page, pageSize);
};

const loadFornecedorRows = async () => {
  const fornecedores = await fornecedorService.getAllData({ page: 1, size: LISTING_FETCH_SIZE });
  return fornecedores.map(mapFornecedorRow);
};

const loadFornecedorPage: ListingConfig<FornecedorRow>["loadPage"] = async ({ page, pageSize }) => {
  const rows = await loadFornecedorRows();
  return buildClientPageResult(rows, page, pageSize);
};

const mapSecretariaRow = (secretaria: SecretariaDTO): SecretariaRow => ({
  idSecretaria: secretaria.idSecretaria,
  nome: secretaria.nome,
  descricao: secretaria.descricao,
  cnpj: secretaria.cnpj,
  cidade: secretaria.cidade,
  estado: secretaria.estado,
  situacaoLabel: getListingSituacaoLabel(secretaria.situacao),
});

const loadSecretariaRows = async () => {
  const secretarias = await secretariaService.getAllData({ page: 1, size: LISTING_FETCH_SIZE });
  return secretarias.map(mapSecretariaRow);
};

const loadSecretariaPage: ListingConfig<SecretariaRow>["loadPage"] = async ({ page, pageSize }) => {
  const rows = await loadSecretariaRows();
  return buildClientPageResult(rows, page, pageSize);
};

const loadInstituicaoRows = async () => {
  const [instituicoes, secretarias, tiposInstituicao] = await Promise.all([
    instituicaoService.getAllData({ page: 1, size: LISTING_FETCH_SIZE }),
    secretariaService.getAllData({ page: 1, size: LISTING_FETCH_SIZE }),
    tipoInstituicaoService.getAllData({ page: 1, size: LISTING_FETCH_SIZE }),
  ]);

  const secretariasMap = new Map(
    secretarias.map(
      (secretaria) => [secretaria.idSecretaria, buildLookupLabel(secretaria.nome, secretaria.situacao)] as const,
    ),
  );
  const tiposMap = new Map(
    tiposInstituicao.map((tipo) => [tipo.id, buildLookupLabel(tipo.descricao, tipo.situacao)] as const),
  );

  return instituicoes.map((instituicao) => ({
    id: instituicao.id,
    nome: instituicao.nome,
    cnpj: instituicao.cnpj,
    cidade: instituicao.cidade,
    estado: instituicao.estado,
    secretariaLabel: secretariasMap.get(instituicao.idSecretaria ?? -1) ?? "Secretaria nao vinculada",
    tipoInstituicaoLabel: tiposMap.get(instituicao.idTipoInstituicao ?? -1) ?? "Tipo nao vinculado",
    situacaoLabel: getListingSituacaoLabel(instituicao.situacao),
  }));
};

const loadInstituicaoPage: ListingConfig<InstituicaoRow>["loadPage"] = async ({ page, pageSize }) => {
  const rows = await loadInstituicaoRows();
  return buildClientPageResult(rows, page, pageSize);
};

const loadOrcamentoRows = async () => {
  const [orcamentos, instituicoes, tiposInstituicao] = await Promise.all([
    orcamentoService.getAllData({ page: 1, size: LISTING_FETCH_SIZE }),
    instituicaoService.getAllData({ page: 1, size: LISTING_FETCH_SIZE }),
    tipoInstituicaoService.getAllData({ page: 1, size: LISTING_FETCH_SIZE }),
  ]);

  const instituicoesMap = new Map(instituicoes.map((instituicao) => [instituicao.id, instituicao.nome] as const));
  const tiposMap = new Map(tiposInstituicao.map((tipo) => [tipo.id, tipo.descricao] as const));

  return filterActiveRecords(orcamentos).map((orcamento: OrcamentoDTO) => {
    const ano = Number(orcamento.anoOrcamento ?? orcamento.ano ?? 0);
    const valor = Number(orcamento.valorOrcamento ?? orcamento.valor ?? 0);

    return {
      idOrcamento: orcamento.idOrcamento,
      ano,
      valor,
      valorFormatado: formatCurrency(valor),
      instituicaoLabel: instituicoesMap.get(orcamento.idInstituicao ?? -1) ?? "Instituicao nao vinculada",
      tipoDespesaLabel: tiposMap.get(orcamento.idTipoDespesa ?? -1) ?? "Tipo nao vinculado",
      situacaoLabel: getListingSituacaoLabel(orcamento.situacao ?? SITUACAO_ATIVO),
    };
  });
};

const loadOrcamentoPage: ListingConfig<OrcamentoRow>["loadPage"] = async ({ page, pageSize }) => {
  const rows = await loadOrcamentoRows();
  return buildClientPageResult(rows, page, pageSize);
};

const DESPESA_SORT_BY: Record<string, string> = {
  numeroDocumento: "numeroDocumento",
  dataEmissao: "dataEmissao",
  dataVencimento: "dataVencimento",
  consumoPrevisto: "consumoPrevisto",
  fornecedorLabel: "idFornecedor",
  tipoDespesaLabel: "idTipoDespesa",
  situacaoLabel: "situacao",
};

const mapDespesaRow = (
  despesa: DespesaDTO,
  fornecedoresMap: Map<number, string>,
  tiposDespesaMap: Map<number, string>,
): DespesaRow => {
  const dataEmissao = despesa.dataEmissao ?? despesa.dataEmicao ?? despesa.data ?? "";
  const dataVencimento = despesa.dataVencimento ?? despesa.data ?? "";
  const consumoPrevisto = Number(
    despesa.consumoPrevisto ?? despesa.valorPrevisto ?? despesa.valor ?? despesa.valorPago ?? 0,
  );

  return {
    id: despesa.id,
    numeroDocumento: String(despesa.numeroDocumento ?? despesa.codigo ?? despesa.id),
    dataEmissao,
    dataVencimento,
    consumoPrevisto: Number.isFinite(consumoPrevisto) ? consumoPrevisto : 0,
    fornecedorLabel:
      fornecedoresMap.get(despesa.idFornecedor ?? despesa.fornecedorId ?? -1) ?? "Fornecedor nao vinculado",
    tipoDespesaLabel: tiposDespesaMap.get(despesa.idTipoDespesa ?? -1) ?? "Tipo nao vinculado",
    situacaoLabel: getListingSituacaoLabel(despesa.status ?? despesa.situacao ?? SITUACAO_ATIVO),
  };
};

const loadDespesaRows = async ({
  sortColumnId,
  sortDirection,
}: Parameters<ListingConfig<DespesaRow>["loadPage"]>[0]) => {
  const sortBy = sortColumnId ? DESPESA_SORT_BY[sortColumnId] : undefined;
  const [firstPage, fornecedores, tiposDespesa] = await Promise.all([
    despesaService.getPage({
      page: 1,
      size: SERVER_EXPORT_PAGE_SIZE,
      sortBy,
      sortDirection: sortBy ? sortDirection : undefined,
    }),
    fornecedorService.getAllData({ page: 1, size: LISTING_FETCH_SIZE }),
    tipoDespesaService.getAllData({ page: 1, size: LISTING_FETCH_SIZE }),
  ]);

  const despesas = [...firstPage.items];
  const totalPages = Math.max(firstPage.totalPages, 1);

  for (let pageStart = 2; pageStart <= totalPages; pageStart += SERVER_EXPORT_PAGE_BATCH_SIZE) {
    const batchPages = Array.from(
      { length: Math.min(SERVER_EXPORT_PAGE_BATCH_SIZE, totalPages - pageStart + 1) },
      (_, index) => pageStart + index,
    );
    const pages = await Promise.all(
      batchPages.map((currentPage) =>
        despesaService.getPage({
          page: currentPage,
          size: SERVER_EXPORT_PAGE_SIZE,
          sortBy,
          sortDirection: sortBy ? sortDirection : undefined,
        }),
      ),
    );

    pages.forEach((pageResult) => {
      despesas.push(...pageResult.items);
    });
  }

  const fornecedoresMap = new Map(
    fornecedores.map((fornecedor) => [fornecedor.idFornecedor, fornecedor.nomeFantasia || fornecedor.nome] as const),
  );
  const tiposDespesaMap = new Map(
    tiposDespesa.map((tipo) => [tipo.id, buildLookupLabel(tipo.descricao, tipo.situacao)] as const),
  );

  return filterActiveRecords(despesas).map((despesa) => mapDespesaRow(despesa, fornecedoresMap, tiposDespesaMap));
};

const loadDespesaPage: ListingConfig<DespesaRow>["loadPage"] = async ({
  page,
  pageSize,
  search,
  filterValues,
  sortColumnId,
  sortDirection,
}) => {
  const rows = await loadDespesaRows({
    page: 1,
    pageSize,
    search,
    filterValues,
    sortColumnId,
    sortDirection,
  });

  return buildClientPageResult(rows, page, pageSize);
};

const listingRegistry: ListingRegistry = {
  "central-usuarios": {
    id: "central-usuarios",
    label: "Usuarios",
    description: "Acompanhe perfis, matriculas e status de acesso em uma unica visao.",
    icon: "group",
    category: "Acesso",
    emptyTitle: "Nenhum usuario encontrado",
    emptyDescription: "Ajuste os filtros ou cadastre novos usuarios no modulo de origem.",
    defaultPageSize: 10,
    pageSizeOptions: DEFAULT_PAGE_SIZES,
    presets: [
      { id: "todos", label: "Todos" },
      { id: "ativos", label: "Ativos", filterValues: { situacaoLabel: "Ativo" } },
      { id: "administradores", label: "Administradores", filterValues: { tipoUsuarioLabel: "Administrador" } },
    ],
    columns: [
      { id: "nome", label: "Nome", accessor: (row) => row.nome, sortType: "text" },
      { id: "cpf", label: "CPF", accessor: (row) => row.cpf, sortType: "text" },
      { id: "matricula", label: "Matricula", accessor: (row) => row.matricula, sortType: "text" },
      { id: "cidade", label: "Cidade", accessor: (row) => row.cidade, sortType: "text" },
      { id: "estado", label: "Estado", accessor: (row) => row.estado, sortType: "text" },
      { id: "email", label: "E-mail", accessor: (row) => row.email, sortType: "text", defaultVisible: false },
      { id: "tipoUsuarioLabel", label: "Tipo", accessor: (row) => row.tipoUsuarioLabel, sortType: "text" },
      { id: "situacaoLabel", label: "Situacao", accessor: (row) => row.situacaoLabel, sortType: "text" },
    ],
    filters: [
      { id: "cidade", label: "Cidade", type: "text" },
      { id: "estado", label: "Estado", type: "text" },
      { id: "tipoUsuarioLabel", label: "Tipo", type: "select" },
      { id: "situacaoLabel", label: "Situacao", type: "select", options: SITUACAO_FILTER_OPTIONS },
    ],
    loadPage: loadUsuarioPage,
    loadExportRows: loadUsuarioRows,
    getRowId: (row) => pickRowIdentifier(row.id, row.cpf, row.email, row.nome),
  },
  "central-despesas": {
    id: "central-despesas",
    label: "Despesas",
    description: "Consulte despesas paginadas pelo servidor com filtros, datas e exportacao da visao atual.",
    icon: "sell",
    category: "Financeiro",
    emptyTitle: "Nenhuma despesa encontrada",
    emptyDescription: "Ajuste os filtros ou confira se ha despesas disponiveis no backend.",
    paginationMode: "server",
    defaultPageSize: 10,
    pageSizeOptions: DEFAULT_PAGE_SIZES,
    presets: [
      { id: "todos", label: "Todos" },
      { id: "ativas", label: "Ativas", filterValues: { situacaoLabel: "Ativo" } },
      { id: "alto-consumo", label: "Alto consumo", filterValues: { consumoPrevisto: "500|" } },
    ],
    columns: [
      { id: "numeroDocumento", label: "Documento", accessor: (row) => row.numeroDocumento, sortType: "text" },
      {
        id: "dataEmissao",
        label: "Emissao",
        accessor: (row) => row.dataEmissao,
        sortType: "date",
        render: (value) => formatDate(value),
      },
      {
        id: "dataVencimento",
        label: "Vencimento",
        accessor: (row) => row.dataVencimento,
        sortType: "date",
        render: (value) => formatDate(value),
      },
      {
        id: "consumoPrevisto",
        label: "Valor/Consumo",
        accessor: (row) => row.consumoPrevisto,
        sortType: "number",
        align: "right",
        render: (value) => formatCurrency(Number(value ?? 0)),
      },
      { id: "fornecedorLabel", label: "Fornecedor", accessor: (row) => row.fornecedorLabel, sortType: "text" },
      { id: "tipoDespesaLabel", label: "Tipo", accessor: (row) => row.tipoDespesaLabel, sortType: "text" },
      { id: "situacaoLabel", label: "Situacao", accessor: (row) => row.situacaoLabel, sortType: "text" },
    ],
    filters: [
      { id: "dataVencimento", label: "Vencimento", type: "date-range" },
      { id: "consumoPrevisto", label: "Valor/Consumo", type: "number-range" },
      { id: "fornecedorLabel", label: "Fornecedor", type: "select" },
      { id: "tipoDespesaLabel", label: "Tipo", type: "select" },
      { id: "situacaoLabel", label: "Situacao", type: "select", options: SITUACAO_FILTER_OPTIONS },
    ],
    loadPage: loadDespesaPage,
    loadExportRows: loadDespesaRows,
    getRowId: (row) => pickRowIdentifier(row.id, row.numeroDocumento),
  },
  "central-fornecedores": {
    id: "central-fornecedores",
    label: "Fornecedores",
    description: "Centralize a visualizacao de contato, localidade e situacao dos fornecedores.",
    icon: "box",
    category: "Cadastros",
    emptyTitle: "Nenhum fornecedor encontrado",
    emptyDescription: "Tente outro conjunto de filtros para localizar fornecedores.",
    defaultPageSize: 10,
    pageSizeOptions: DEFAULT_PAGE_SIZES,
    presets: [
      { id: "todos", label: "Todos" },
      { id: "ativos", label: "Ativos", filterValues: { situacaoLabel: "Ativo" } },
      { id: "inativos", label: "Inativos", filterValues: { situacaoLabel: "Inativo" } },
      { id: "interior", label: "Somente por cidade", description: "Filtre por cidade e telefone." },
    ],
    columns: [
      { id: "nomeFantasia", label: "Nome Fantasia", accessor: (row) => row.nomeFantasia, sortType: "text" },
      { id: "nome", label: "Razao Social", accessor: (row) => row.nome, sortType: "text" },
      { id: "cnpj", label: "CNPJ", accessor: (row) => row.cnpj, sortType: "text" },
      { id: "telefone", label: "Telefone", accessor: (row) => row.telefone, sortType: "text", defaultVisible: false },
      { id: "cidade", label: "Cidade", accessor: (row) => row.cidade, sortType: "text" },
      { id: "estado", label: "Estado", accessor: (row) => row.estado, sortType: "text" },
      { id: "situacaoLabel", label: "Situacao", accessor: (row) => row.situacaoLabel, sortType: "text" },
    ],
    filters: [
      { id: "cidade", label: "Cidade", type: "text" },
      { id: "estado", label: "Estado", type: "text" },
      { id: "situacaoLabel", label: "Situacao", type: "select", options: SITUACAO_FILTER_OPTIONS },
    ],
    loadPage: loadFornecedorPage,
    loadExportRows: loadFornecedorRows,
    getRowId: (row) => pickRowIdentifier(row.idFornecedor, row.cnpj, row.nomeFantasia, row.nome),
  },
  "central-secretarias": {
    id: "central-secretarias",
    label: "Secretarias",
    description: "Consulte secretarias e seus dados institucionais em uma visao reutilizavel.",
    icon: "account_balance",
    category: "Cadastros",
    emptyTitle: "Nenhuma secretaria encontrada",
    emptyDescription: "Nao ha secretarias disponiveis para a selecao atual.",
    defaultPageSize: 10,
    pageSizeOptions: DEFAULT_PAGE_SIZES,
    presets: [
      { id: "todos", label: "Todos" },
      { id: "ativos", label: "Ativos", filterValues: { situacaoLabel: "Ativo" } },
      { id: "inativos", label: "Inativos", filterValues: { situacaoLabel: "Inativo" } },
    ],
    columns: [
      { id: "nome", label: "Nome", accessor: (row) => row.nome, sortType: "text" },
      {
        id: "descricao",
        label: "Descricao",
        accessor: (row) => row.descricao,
        sortType: "text",
        defaultVisible: false,
      },
      { id: "cnpj", label: "CNPJ", accessor: (row) => row.cnpj, sortType: "text" },
      { id: "cidade", label: "Cidade", accessor: (row) => row.cidade, sortType: "text" },
      { id: "estado", label: "Estado", accessor: (row) => row.estado, sortType: "text" },
      { id: "situacaoLabel", label: "Situacao", accessor: (row) => row.situacaoLabel, sortType: "text" },
    ],
    filters: [
      { id: "cidade", label: "Cidade", type: "text" },
      { id: "estado", label: "Estado", type: "text" },
      { id: "situacaoLabel", label: "Situacao", type: "select", options: SITUACAO_FILTER_OPTIONS },
    ],
    loadPage: loadSecretariaPage,
    loadExportRows: loadSecretariaRows,
    getRowId: (row) => pickRowIdentifier(row.idSecretaria, row.cnpj, row.nome),
  },
  "central-instituicoes": {
    id: "central-instituicoes",
    label: "Instituicoes",
    description: "Reuna instituicoes, vinculos e situacoes sem depender da tela CRUD original.",
    icon: "flowchart",
    category: "Cadastros",
    emptyTitle: "Nenhuma instituicao encontrada",
    emptyDescription: "Revise os filtros ou aguarde o carregamento de dados vinculados.",
    defaultPageSize: 10,
    pageSizeOptions: DEFAULT_PAGE_SIZES,
    presets: [
      { id: "todos", label: "Todos" },
      { id: "ativas", label: "Ativas", filterValues: { situacaoLabel: "Ativo" } },
      { id: "inativas", label: "Inativas", filterValues: { situacaoLabel: "Inativo" } },
      { id: "sem-vinculo", label: "Sem vinculo", filterValues: { tipoInstituicaoLabel: "Tipo nao vinculado" } },
    ],
    columns: [
      { id: "nome", label: "Nome", accessor: (row) => row.nome, sortType: "text" },
      { id: "cnpj", label: "CNPJ", accessor: (row) => row.cnpj, sortType: "text" },
      { id: "cidade", label: "Cidade", accessor: (row) => row.cidade, sortType: "text" },
      { id: "estado", label: "Estado", accessor: (row) => row.estado, sortType: "text" },
      { id: "secretariaLabel", label: "Secretaria", accessor: (row) => row.secretariaLabel, sortType: "text" },
      { id: "tipoInstituicaoLabel", label: "Tipo", accessor: (row) => row.tipoInstituicaoLabel, sortType: "text" },
      { id: "situacaoLabel", label: "Situacao", accessor: (row) => row.situacaoLabel, sortType: "text" },
    ],
    filters: [
      { id: "cidade", label: "Cidade", type: "text" },
      { id: "estado", label: "Estado", type: "text" },
      { id: "secretariaLabel", label: "Secretaria", type: "select" },
      { id: "tipoInstituicaoLabel", label: "Tipo", type: "select" },
      { id: "situacaoLabel", label: "Situacao", type: "select", options: SITUACAO_FILTER_OPTIONS },
    ],
    loadPage: loadInstituicaoPage,
    loadExportRows: loadInstituicaoRows,
    getRowId: (row) => pickRowIdentifier(row.id, row.cnpj, row.nome),
  },
  "central-orcamentos": {
    id: "central-orcamentos",
    label: "Orcamentos",
    description: "Visualize diferentes recortes de orcamentos com filtros, ordenacao e exportacao.",
    icon: "request_quote",
    category: "Planejamento",
    emptyTitle: "Nenhum orcamento encontrado",
    emptyDescription: "Aplique outro recorte para consultar os orcamentos disponiveis.",
    defaultPageSize: 10,
    pageSizeOptions: DEFAULT_PAGE_SIZES,
    presets: [
      { id: "todos", label: "Todos" },
      { id: "ativos", label: "Ativos", filterValues: { situacaoLabel: "Ativo" } },
      { id: "alto-valor", label: "Faixa alta", filterValues: { valor: "100000|" } },
    ],
    columns: [
      { id: "idOrcamento", label: "ID", accessor: (row) => row.idOrcamento, sortType: "number", defaultVisible: false },
      { id: "ano", label: "Ano", accessor: (row) => row.ano, sortType: "number" },
      {
        id: "valor",
        label: "Valor",
        accessor: (row) => row.valor,
        sortType: "number",
        align: "right",
        render: (value) => formatCurrency(Number(value ?? 0)),
      },
      { id: "instituicaoLabel", label: "Instituicao", accessor: (row) => row.instituicaoLabel, sortType: "text" },
      { id: "tipoDespesaLabel", label: "Tipo de Despesa", accessor: (row) => row.tipoDespesaLabel, sortType: "text" },
      { id: "situacaoLabel", label: "Situacao", accessor: (row) => row.situacaoLabel, sortType: "text" },
    ],
    filters: [
      { id: "ano", label: "Ano", type: "number-range" },
      { id: "valor", label: "Valor", type: "number-range" },
      { id: "instituicaoLabel", label: "Instituicao", type: "select" },
      { id: "tipoDespesaLabel", label: "Tipo de Despesa", type: "select" },
      { id: "situacaoLabel", label: "Situacao", type: "select", options: SITUACAO_FILTER_OPTIONS },
    ],
    loadPage: loadOrcamentoPage,
    loadExportRows: loadOrcamentoRows,
    getRowId: (row) =>
      pickRowIdentifier(row.idOrcamento, combineRowIdentifier(row.ano, row.instituicaoLabel, row.tipoDespesaLabel)),
  },
};

export const LISTING_CENTER_REGISTRY = listingRegistry;
export const LISTING_CENTER_CONFIGS = Object.values(listingRegistry);
