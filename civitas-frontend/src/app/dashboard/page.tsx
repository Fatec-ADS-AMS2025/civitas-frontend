"use client";

import React, { useMemo, useState } from "react";
import { EmptyState, ErrorState } from "@/components/feedback-states";
import {
  DASHBOARD_HIDDEN_VALUE,
  DashboardDueSoonSection,
  DashboardOverviewSection,
  DashboardRecentExpensesSection,
  type DashboardQuickLink,
  type DashboardSummaryRow,
  type DueSoonExpense,
  getDaysUntilDate,
  normalizeText,
  formatCurrency,
} from "./_components";
import { useDashboardHeader } from "@/components/dashboard/dashboard-header";
import { useAppNavigation } from "@/hooks/useNavigationProgress";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useDespesasDashboard } from "@/hooks/useDespesasDashboard";
import DashboardSkeleton from "./skeleton";

const DASHBOARD_QUICK_LINKS: DashboardQuickLink[] = [
  { label: "Despesas", href: "/dashboard/despesas" },
  { label: "Orcamentos", href: "/dashboard/orcamentos" },
  { label: "Instituicoes", href: "/dashboard/instituicoes" },
  { label: "Fornecedores", href: "/dashboard/fornecedor" },
];

export default function Dashboard() {
  const router = useAppNavigation();
  const [showMoneyValues, setShowMoneyValues] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    filteredDespesas,
    orcamentos,
    instituicoes,
    fornecedores,
    usuarios,
    summary,
    loading,
    error,
    refetch,
  } = useDespesasDashboard();

  const toggleMoneyValues = () => {
    setShowMoneyValues((previous) => !previous);
  };

  const headerConfig = useMemo(
    () => ({
      title: "Dashboard",
      eyebrow: "Visao geral",
      subtitle: "Resumo operacional e financeiro do sistema.",
      breadcrumbs: [
        { label: "Home", href: "/dashboard" },
        { label: "Dashboard" },
      ],
      actions: [
        {
          label: "Atualizar painel",
          icon: "refresh",
          variant: "primary" as const,
          onClick: () => {
            void refetch();
          },
        },
        {
          label: showMoneyValues ? "Ocultar valores" : "Exibir valores",
          icon: showMoneyValues ? "visibility_off" : "visibility",
          variant: "ghost" as const,
          onClick: toggleMoneyValues,
        },
      ],
    }),
    [refetch, showMoneyValues]
  );

  useDashboardHeader(headerConfig);

  const summaryRows = useMemo<DashboardSummaryRow[]>(
    () => [
      {
        label: "Saldo atual",
        value: showMoneyValues ? formatCurrency(summary.saldoTotal) : DASHBOARD_HIDDEN_VALUE,
        helper: "Orcamentos menos despesas registradas.",
        toggleable: true,
      },
      {
        label: "Total orcado",
        value: showMoneyValues ? formatCurrency(summary.entrada) : DASHBOARD_HIDDEN_VALUE,
        helper: `${orcamentos.length} orcamento(s) carregado(s).`,
        toggleable: true,
      },
      {
        label: "Total gasto",
        value: showMoneyValues ? formatCurrency(summary.saida) : DASHBOARD_HIDDEN_VALUE,
        helper: `${filteredDespesas.length} despesa(s) na visao atual.`,
        toggleable: true,
      },
      {
        label: "Base ativa",
        value: `${instituicoes.length} instituicoes / ${usuarios.length} usuarios`,
        helper: `${fornecedores.length} fornecedor(es) cadastrado(s).`,
      },
    ],
    [
      filteredDespesas.length,
      fornecedores.length,
      instituicoes.length,
      orcamentos.length,
      showMoneyValues,
      summary.entrada,
      summary.saida,
      summary.saldoTotal,
      usuarios.length,
    ]
  );

  const filteredRecentExpenses = useMemo(() => {
    const query = normalizeText(searchTerm);

    if (!query) {
      return filteredDespesas;
    }

    return filteredDespesas.filter((item) => {
      return normalizeText(
        `${item.descricao} ${item.numeroDocumento} ${item.categoria} ${item.id}`
      ).includes(query);
    });
  }, [filteredDespesas, searchTerm]);

  const {
    currentPage,
    pageSize,
    totalPages,
    totalRecords,
    paginatedItems,
    isPending,
    goToPage,
    changePageSize,
  } = useClientPagination(filteredRecentExpenses, { initialPageSize: 5 });

  const dueSoonExpenses = useMemo<DueSoonExpense[]>(() => {
    return filteredDespesas
      .map((item) => ({
        ...item,
        daysUntilDue: getDaysUntilDate(item.raw.dataVencimento ?? item.data),
      }))
      .filter((item) => item.daysUntilDue !== null && item.daysUntilDue <= 7)
      .sort((a, b) => (a.daysUntilDue ?? 999) - (b.daysUntilDue ?? 999))
      .slice(0, 5);
  }, [filteredDespesas]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Nao foi possivel carregar a dashboard"
        description={error}
        actionLabel="Atualizar painel"
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-5">
      <DashboardOverviewSection
        quickLinks={DASHBOARD_QUICK_LINKS}
        summaryRows={summaryRows}
        hiddenValue={DASHBOARD_HIDDEN_VALUE}
        onNavigate={router.push}
        onToggleValues={toggleMoneyValues}
      />

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <DashboardRecentExpensesSection
          currentPage={currentPage}
          isPending={isPending}
          items={paginatedItems}
          pageSize={pageSize}
          searchTerm={searchTerm}
          showMoneyValues={showMoneyValues}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
          onSearchChange={setSearchTerm}
        />

        <DashboardDueSoonSection
          items={dueSoonExpenses}
          showMoneyValues={showMoneyValues}
        />
      </section>
    </div>
  );
}
