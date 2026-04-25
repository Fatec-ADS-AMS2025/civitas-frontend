"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useAppNavigation } from "@/hooks/useNavigationProgress";

export type DashboardHeaderBreadcrumb = {
  label: string;
  href?: string;
};

export type DashboardHeaderAction = {
  label: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  ariaLabel?: string;
};

export type DashboardHeaderConfig = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  breadcrumbs?: DashboardHeaderBreadcrumb[];
  actions?: DashboardHeaderAction[];
};

type DashboardHeaderContextValue = {
  headerConfig: DashboardHeaderConfig;
  setHeaderConfig: (config: DashboardHeaderConfig) => void;
  clearHeaderConfig: () => void;
};

const DASHBOARD_HEADER_META: Record<string, DashboardHeaderConfig> = {
  "/dashboard": {
    title: "Dashboard",
    eyebrow: "Visão geral",
    subtitle: "Panorama operacional e financeiro com leitura rápida do sistema.",
    breadcrumbs: [
      { label: "Home", href: "/dashboard" },
      { label: "Dashboard" },
    ],
  },
  "/dashboard/despesas": {
    title: "Despesas",
    eyebrow: "Operação",
    subtitle: "Acompanhe despesas, filtros e manutenção dos registros do módulo.",
    breadcrumbs: [
      { label: "Home", href: "/dashboard" },
      { label: "Cadastros", href: "/dashboard/despesas" },
      { label: "Despesas" },
    ],
  },
  "/dashboard/secretaria": {
    title: "Secretarias",
    eyebrow: "Cadastros",
    subtitle: "Gestão de secretarias com busca, edição e controle de situação.",
    breadcrumbs: [
      { label: "Home", href: "/dashboard" },
      { label: "Cadastros", href: "/dashboard/secretaria" },
      { label: "Secretarias" },
    ],
  },
  "/dashboard/instituicoes": {
    title: "Instituições",
    eyebrow: "Cadastros",
    subtitle: "Cadastro e manutenção das instituições vinculadas ao sistema.",
    breadcrumbs: [
      { label: "Home", href: "/dashboard" },
      { label: "Cadastros", href: "/dashboard/instituicoes" },
      { label: "Instituições" },
    ],
  },
  "/dashboard/fornecedor": {
    title: "Fornecedores",
    eyebrow: "Cadastros",
    subtitle: "Controle de fornecedores com paginação e gestão de situação.",
    breadcrumbs: [
      { label: "Home", href: "/dashboard" },
      { label: "Cadastros", href: "/dashboard/fornecedor" },
      { label: "Fornecedores" },
    ],
  },
  "/dashboard/orcamentos": {
    title: "Orçamentos",
    eyebrow: "Planejamento",
    subtitle: "Consulte orçamentos, vínculos institucionais e tipos de despesa.",
    breadcrumbs: [
      { label: "Home", href: "/dashboard" },
      { label: "Planejamento", href: "/dashboard/orcamentos" },
      { label: "Orçamentos" },
    ],
  },
  "/dashboard/financeiro": {
    title: "Financeiro",
    eyebrow: "Monitoramento",
    subtitle: "Resumo financeiro, filtros operacionais e movimentações do painel.",
    breadcrumbs: [
      { label: "Home", href: "/dashboard" },
      { label: "Financeiro" },
    ],
  },
  "/dashboard/configuracoes": {
    title: "Configurações",
    eyebrow: "Administração",
    subtitle: "Parâmetros de apoio ao sistema e cadastros auxiliares do dashboard.",
    breadcrumbs: [
      { label: "Home", href: "/dashboard" },
      { label: "Configurações" },
    ],
  },
  "/dashboard/usuarios": {
    title: "Usuários",
    eyebrow: "Acesso",
    subtitle: "Gerencie usuários, perfis e situação de acesso ao sistema.",
    breadcrumbs: [
      { label: "Home", href: "/dashboard" },
      { label: "Usuários" },
    ],
  },
};

const DashboardHeaderContext = createContext<DashboardHeaderContextValue | null>(null);

const normalizeSegmentLabel = (segment: string): string => {
  const normalized = segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return normalized;
};

const buildFallbackConfig = (pathname: string): DashboardHeaderConfig => {
  const segments = pathname.split("/").filter(Boolean);
  const title = segments.length > 0 ? normalizeSegmentLabel(segments[segments.length - 1]) : "Dashboard";

  const breadcrumbs = segments.map((segment, index) => ({
    label: normalizeSegmentLabel(segment),
    href: index < segments.length - 1 ? `/${segments.slice(0, index + 1).join("/")}` : undefined,
  }));

  return {
    title,
    eyebrow: segments.length > 1 ? normalizeSegmentLabel(segments[segments.length - 2]) : "Dashboard",
    breadcrumbs,
  };
};

export function DashboardHeaderProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname() || "/dashboard";
  const [overrideConfig, setOverrideConfig] = useState<DashboardHeaderConfig | null>(null);

  const baseConfig = useMemo(() => {
    return DASHBOARD_HEADER_META[pathname] ?? buildFallbackConfig(pathname);
  }, [pathname]);

  useEffect(() => {
    setOverrideConfig(null);
  }, [pathname]);

  const setHeaderConfig = useCallback((config: DashboardHeaderConfig) => {
    setOverrideConfig(config);
  }, []);

  const clearHeaderConfig = useCallback(() => {
    setOverrideConfig(null);
  }, []);

  const headerConfig = useMemo<DashboardHeaderConfig>(() => {
    if (!overrideConfig) return baseConfig;

    return {
      ...baseConfig,
      ...overrideConfig,
      breadcrumbs: overrideConfig.breadcrumbs ?? baseConfig.breadcrumbs,
      actions: overrideConfig.actions ?? baseConfig.actions,
    };
  }, [baseConfig, overrideConfig]);

  const value = useMemo<DashboardHeaderContextValue>(
    () => ({
      headerConfig,
      setHeaderConfig,
      clearHeaderConfig,
    }),
    [clearHeaderConfig, headerConfig, setHeaderConfig]
  );

  return (
    <DashboardHeaderContext.Provider value={value}>
      {children}
    </DashboardHeaderContext.Provider>
  );
}

export function useDashboardHeader(config: DashboardHeaderConfig) {
  const context = useContext(DashboardHeaderContext);

  useEffect(() => {
    if (!context) return undefined;

    context.setHeaderConfig(config);

    return () => {
      context.clearHeaderConfig();
    };
  }, [config, context]);
}

export function useResolvedDashboardHeader() {
  const context = useContext(DashboardHeaderContext);

  if (!context) {
    throw new Error("useResolvedDashboardHeader must be used inside DashboardHeaderProvider.");
  }

  return context.headerConfig;
}

export function DashboardPageHeader() {
  const { push } = useAppNavigation();
  const header = useResolvedDashboardHeader();
  const breadcrumbs = header.breadcrumbs ?? [];
  const actions = header.actions ?? [];

  return (
    <section className="civitas-surface civitas-enter mb-5 px-5 py-4 sm:px-6 lg:mb-6 lg:px-6 lg:py-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          {header.eyebrow ? (
            <span className="civitas-panel-header__eyebrow">
              <span className="material-symbols-outlined !text-[16px]">dashboard</span>
              {header.eyebrow}
            </span>
          ) : null}

          {breadcrumbs.length > 0 ? (
            <nav
              aria-label="Breadcrumb"
              className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-[var(--foreground-soft)] sm:text-sm"
            >
              {breadcrumbs.map((item, index) => {
                const isClickable = Boolean(item.href);

                return (
                  <React.Fragment key={`${item.label}-${index}`}>
                    {isClickable ? (
                      <button
                        type="button"
                        onClick={() => push(item.href!)}
                        className="transition-colors duration-200 hover:text-[var(--secundary-1)]"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <span className="font-semibold text-[var(--foreground-muted)]">{item.label}</span>
                    )}
                    {index < breadcrumbs.length - 1 ? (
                      <span aria-hidden="true" className="text-[var(--border-strong)]">
                        /
                      </span>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </nav>
          ) : null}

          <h1 className="mt-3 text-[26px] font-semibold leading-tight text-[var(--secundary-1)] sm:text-[30px] lg:text-[32px]">
            {header.title}
          </h1>

          {header.subtitle ? (
            <p className="mt-1.5 max-w-3xl text-sm leading-6 text-[var(--foreground-muted)]">
              {header.subtitle}
            </p>
          ) : null}
        </div>

        {actions.length > 0 ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap xl:justify-end">
            {actions.map((action) => {
              const variant = action.variant ?? "ghost";
              const actionClassName =
                variant === "primary"
                  ? "civitas-action civitas-action--primary"
                  : variant === "secondary"
                    ? "civitas-action civitas-action--secondary"
                    : "civitas-action civitas-action--ghost";

              return (
                <button
                  key={`${action.label}-${action.icon ?? "no-icon"}`}
                  type="button"
                  aria-label={action.ariaLabel ?? action.label}
                  onClick={() => {
                    if (action.onClick) {
                      action.onClick();
                      return;
                    }

                    if (action.href) {
                      push(action.href);
                    }
                  }}
                  className={actionClassName}
                >
                  {action.icon ? (
                    <span className="material-symbols-outlined !text-[18px]">{action.icon}</span>
                  ) : null}
                  {action.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
