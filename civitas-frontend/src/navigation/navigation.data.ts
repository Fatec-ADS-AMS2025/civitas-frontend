import {
  type NavigationItem,
  type ResolvedNavigationMeta,
  type NavigationBreadcrumb,
} from "./navigation.types";

export const NAVIGATION_CATALOG: NavigationItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    keywords: ["inicio", "home", "painel", "visao geral"],
    category: "Principal",
    icon: "home",
    priority: 100,
  },
  {
    key: "despesas",
    label: "Despesas",
    path: "/dashboard/despesas",
    keywords: ["gastos", "pagamentos", "listagem de despesa", "despesa"],
    category: "Financeiro",
    icon: "sell",
    priority: 95,
  },
  {
    key: "orcamentos",
    label: "Orcamentos",
    path: "/dashboard/orcamentos",
    keywords: ["orcamento", "planejamento", "previsao", "custo"],
    category: "Financeiro",
    icon: "request_quote",
    priority: 90,
  },
  {
    key: "financeiro",
    label: "Financeiro",
    path: "/dashboard/financeiro",
    keywords: ["financeiro", "saldo", "resumo financeiro"],
    category: "Financeiro",
    icon: "finance_mode",
    priority: 85,
  },
  {
    key: "secretaria",
    label: "Secretaria",
    path: "/dashboard/secretaria",
    keywords: ["secretarias", "orgao", "setor"],
    category: "Cadastros",
    icon: "account_balance",
    priority: 80,
  },
  {
    key: "instituicoes",
    label: "Instituicoes",
    path: "/dashboard/instituicoes",
    keywords: ["instituicao", "instituicoes", "unidade", "entidade"],
    category: "Cadastros",
    icon: "flowchart",
    priority: 75,
  },
  {
    key: "fornecedor",
    label: "Fornecedor",
    path: "/dashboard/fornecedor",
    keywords: ["fornecedores", "empresa", "prestador"],
    category: "Cadastros",
    icon: "box",
    priority: 70,
  },
  {
    key: "usuarios",
    label: "Usuarios",
    path: "/dashboard/usuarios",
    keywords: ["usuario", "usuarios", "acesso", "permissoes"],
    category: "Administracao",
    icon: "group",
    priority: 60,
  },
  {
    key: "configuracoes",
    label: "Configuracoes",
    path: "/dashboard/configuracoes",
    keywords: ["config", "preferencias", "ajustes"],
    category: "Administracao",
    icon: "tune",
    priority: 55,
  },
  {
    key: "perfil",
    label: "Perfil",
    path: "/perfil",
    keywords: ["conta", "usuario", "meu perfil"],
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
