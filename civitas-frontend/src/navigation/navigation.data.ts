import {
  type NavigationItem,
  type ResolvedNavigationMeta,
  type NavigationBreadcrumb,
} from "./navigation.types";

export const NAVIGATION_CATALOG: NavigationItem[] = [
  {
    key: "central-listagens",
    label: "Central de Listagens",
    path: "/dashboard/central-listagens",
    keywords: ["listagens", "tabelas", "central", "filtros", "exportacao"],
    features: [
      "alternar entre listagens",
      "salvar filtros temporarios",
      "controlar colunas visiveis",
      "ordenar por diferentes tipos",
      "exportar a visualizacao atual",
    ],
    category: "Principal",
    icon: "table_chart",
    priority: 98,
  },
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    keywords: ["inicio", "home", "painel", "visao geral"],
    features: [
      "ver panorama operacional",
      "consultar indicadores financeiros",
      "acompanhar despesas recentes",
      "ver vencimentos proximos",
      "acessar atalhos rapidos do sistema",
    ],
    category: "Principal",
    icon: "home",
    priority: 100,
  },
  {
    key: "despesas",
    label: "Despesas",
    path: "/dashboard/despesas",
    keywords: ["gastos", "pagamentos", "listagem de despesa", "despesa"],
    features: [
      "cadastrar despesa",
      "editar despesa",
      "inativar despesa",
      "filtrar despesas",
      "exportar listagem de despesas",
    ],
    category: "Financeiro",
    icon: "sell",
    priority: 95,
  },
  {
    key: "orcamentos",
    label: "Orcamentos",
    path: "/dashboard/orcamentos",
    keywords: ["orcamento", "planejamento", "previsao", "custo"],
    features: [
      "cadastrar orcamento",
      "editar orcamento",
      "excluir orcamento",
      "filtrar orcamentos",
      "vincular instituicao e tipo de despesa",
    ],
    category: "Financeiro",
    icon: "request_quote",
    priority: 90,
  },
  // {
  //   key: "financeiro",
  //   label: "Financeiro",
  //   path: "/dashboard/financeiro",
  //   keywords: ["financeiro", "saldo", "resumo financeiro"],
  //   features: [
  //     "ver resumo financeiro consolidado",
  //     "filtrar transacoes por periodo e status",
  //     "cadastrar despesa e orcamento",
  //     "atualizar transacoes financeiras",
  //     "exportar listagem financeira",
  //   ],
  //   category: "Financeiro",
  //   icon: "finance_mode",
  //   priority: 85,
  // },
  {
    key: "secretaria",
    label: "Secretaria",
    path: "/dashboard/secretaria",
    keywords: ["secretarias", "orgao", "setor"],
    features: [
      "cadastrar secretaria",
      "editar secretaria",
      "alterar situacao da secretaria",
      "filtrar secretarias",
      "consultar dados institucionais da secretaria",
    ],
    category: "Cadastros",
    icon: "account_balance",
    priority: 80,
  },
  {
    key: "instituicoes",
    label: "Instituicoes",
    path: "/dashboard/instituicoes",
    keywords: ["instituicao", "instituicoes", "unidade", "entidade"],
    features: [
      "cadastrar instituicao",
      "editar instituicao",
      "alterar situacao da instituicao",
      "filtrar instituicoes",
      "vincular secretaria e tipo de instituicao",
    ],
    category: "Cadastros",
    icon: "flowchart",
    priority: 75,
  },
  {
    key: "fornecedor",
    label: "Fornecedor",
    path: "/dashboard/fornecedor",
    keywords: ["fornecedores", "empresa", "prestador"],
    features: [
      "cadastrar fornecedor",
      "editar fornecedor",
      "alterar situacao do fornecedor",
      "filtrar fornecedores",
      "consultar dados de contato do fornecedor",
    ],
    category: "Cadastros",
    icon: "box",
    priority: 70,
  },
  {
    key: "unidades-consumidoras",
    label: "Unidades Consumidoras",
    path: "/dashboard/unidades-consumidoras",
    keywords: ["unidade consumidora", "uc", "energia", "consumo"],
    features: [
      "cadastrar unidade consumidora",
      "editar unidade consumidora",
      "excluir unidade consumidora",
      "filtrar unidades consumidoras",
      "vincular instituicao e fornecedor",
    ],
    category: "Cadastros",
    icon: "bolt",
    priority: 65,
  },
  {
    key: "usuarios",
    label: "Usuarios",
    path: "/dashboard/usuarios",
    keywords: ["usuario", "usuarios", "acesso", "permissoes"],
    features: [
      "cadastrar usuario",
      "editar usuario",
      "alterar situacao do usuario",
      "filtrar usuarios",
      "consultar perfil e tipo de usuario",
    ],
    category: "Administracao",
    icon: "group",
    priority: 60,
  },
  {
    key: "configuracoes",
    label: "Configuracoes",
    path: "/dashboard/configuracoes",
    keywords: ["config", "preferencias", "ajustes"],
    features: [
      "gerenciar tipo de instituicao",
      "gerenciar tipo de despesa",
      "gerenciar unidade de medida",
      "filtrar configuracoes",
      "alterar situacao de cadastros auxiliares",
    ],
    category: "Administracao",
    icon: "tune",
    priority: 55,
  },
  {
    key: "perfil",
    label: "Meu Perfil",
    path: "/dashboard/perfil",
    keywords: ["conta", "usuario", "meu perfil"],
    features: [
      "ver dados da conta",
      "consultar perfil do usuario",
      "acessar informacoes pessoais",
    ],
    category: "Conta",
    icon: "person",
    priority: 50,
  },
];

const normalizePath = (path: string): string => {
  const trimmed = path.trim();
  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  return withoutTrailingSlash || "/";
};

const formatSegmentLabel = (segment: string): string => {
  if (!segment) return "";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
};

const findItemByPath = (path: string): NavigationItem | undefined => {
  const normalizedPath = normalizePath(path);
  return NAVIGATION_CATALOG.find(
    (item) => normalizePath(item.path) === normalizedPath,
  );
};

export const resolveNavigationMeta = (pathname: string): ResolvedNavigationMeta => {
  const normalizedPath = normalizePath(pathname || "/dashboard");
  const parts = normalizedPath.split("/").filter(Boolean);

  const breadcrumbs: NavigationBreadcrumb[] = [];

  for (let index = 0; index < parts.length; index += 1) {
    const partialPath = `/${parts.slice(0, index + 1).join("/")}`;
    const matchedItem = findItemByPath(partialPath);

    breadcrumbs.push({
      key: partialPath,
      path: partialPath,
      label: matchedItem?.label ?? formatSegmentLabel(parts[index]),
    });
  }

  const exactItem = findItemByPath(normalizedPath);
  const fallbackTitle =
    breadcrumbs[breadcrumbs.length - 1]?.label ?? "Dashboard";

  return {
    title: exactItem?.label ?? fallbackTitle,
    breadcrumbs,
  };
};

export const getNavigationItemByPath = (pathname: string): NavigationItem | undefined => {
  return findItemByPath(pathname);
};
