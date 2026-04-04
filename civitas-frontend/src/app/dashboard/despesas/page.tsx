"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/button";
import Input from "@/components/Input";
import Modal from "@/components/modal";
import Form, { type FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import Table from "@/components/Table/table";
import type DespesaDTO from "@/models/despesa";
import { useClientPagination } from "@/hooks/useClientPagination";
import { showToast } from "@/hooks/useToast";

type Despesa = DespesaDTO & {
  solicitaUc: boolean;
};

type DespesaTableRow = Despesa & {
  solicitaUcLabel: string;
  valorFormatado: string;
  situacaoLabel: string;
};

const initialDespesas: Despesa[] = [
  {
    id: 1,
    descricao: "Material de escritorio",
    valor: 1240.9,
    data: "2026-03-10",
    categoria: "Administrativo",
    situacao: 1,
    solicitaUc: true,
    fornecedorId: 12,
    secretariaId: 3,
  },
  {
    id: 2,
    descricao: "Transporte escolar",
    valor: 3890,
    data: "2026-03-08",
    categoria: "Transporte",
    situacao: 1,
    solicitaUc: false,
    fornecedorId: 8,
    secretariaId: 4,
  },
  {
    id: 3,
    descricao: "Alimentacao",
    valor: 5780.45,
    data: "2026-03-05",
    categoria: "Merenda",
    situacao: 1,
    solicitaUc: true,
    fornecedorId: 5,
    secretariaId: 2,
  },
  {
    id: 4,
    descricao: "Manutencao predial",
    valor: 2460.75,
    data: "2026-02-28",
    categoria: "Infraestrutura",
    situacao: 0,
    solicitaUc: false,
    fornecedorId: 11,
    secretariaId: 1,
  },
  {
    id: 5,
    descricao: "Contratacao de limpeza",
    valor: 1980.5,
    data: "2026-02-26",
    categoria: "Servicos",
    situacao: 1,
    solicitaUc: false,
    fornecedorId: 2,
    secretariaId: 6,
  },
  {
    id: 6,
    descricao: "Compra de computadores",
    valor: 12990,
    data: "2026-02-21",
    categoria: "Tecnologia",
    situacao: 1,
    solicitaUc: true,
    fornecedorId: 9,
    secretariaId: 5,
  },
];

const emptyDespesa: Despesa = {
  id: 0,
  descricao: "",
  valor: 0,
  data: "",
  categoria: "",
  situacao: 1,
  solicitaUc: false,
  fornecedorId: undefined,
  secretariaId: undefined,
};

const despesaFormFields: ModalFieldConfig[] = [
  { key: "id", hidden: true },
  {
    key: "descricao",
    label: "Descricao",
    placeholder: "Descricao da despesa",
    required: true,
  },
  {
    key: "categoria",
    label: "Categoria",
    placeholder: "Selecione uma categoria",
    type: "select",
    required: true,
    options: [
      { value: "Administrativo", label: "Administrativo" },
      { value: "Transporte", label: "Transporte" },
      { value: "Merenda", label: "Merenda" },
      { value: "Infraestrutura", label: "Infraestrutura" },
      { value: "Servicos", label: "Servicos" },
      { value: "Tecnologia", label: "Tecnologia" },
    ],
  },
  {
    key: "valor",
    label: "Valor",
    placeholder: "0,00",
    type: "number",
    required: true,
  },
  {
    key: "data",
    label: "Data",
    type: "date",
    required: true,
  },
  {
    key: "solicitaUc",
    label: "Solicita UC",
    type: "select",
    required: true,
    options: [
      { value: "true", label: "Sim" },
      { value: "false", label: "Nao" },
    ],
  },
  {
    key: "situacao",
    label: "Situacao",
    type: "select",
    required: true,
    options: [
      { value: "1", label: "Ativo" },
      { value: "0", label: "Inativo" },
    ],
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T00:00:00`));
};

const normalizeDespesa = (formData: Record<string, unknown>): Omit<Despesa, "id"> => ({
  descricao: String(formData.descricao ?? "").trim(),
  valor: Number(formData.valor ?? 0),
  data: String(formData.data ?? ""),
  categoria: String(formData.categoria ?? ""),
  situacao: Number(formData.situacao ?? 1),
  solicitaUc: String(formData.solicitaUc) === "true",
  fornecedorId: formData.fornecedorId ? Number(formData.fornecedorId) : undefined,
  secretariaId: formData.secretariaId ? Number(formData.secretariaId) : undefined,
});

const summaryCards = [
  {
    title: "Valor disponivel",
    subtitle: "Saldo restante apos os filtros aplicados",
    background: "linear-gradient(135deg, #0D7C7C 0%, #66B8B7 100%)",
    textClass: "text-white",
    icon: "account_balance",
  },
  {
    title: "Balanca",
    subtitle: "Comparativo entre saldo e despesas",
    background: "linear-gradient(135deg, #1D1D1D 0%, #555555 100%)",
    textClass: "text-white",
    icon: "balance",
  },
  {
    title: "Gastos totais",
    subtitle: "Valor consolidado das despesas listadas",
    background: "linear-gradient(135deg, #F18B1B 0%, #FFB354 100%)",
    textClass: "text-white",
    icon: "monetization_on",
  },
];

export default function Page() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [descricaoQuery, setDescricaoQuery] = useState("");
  const [solicitaUcQuery, setSolicitaUcQuery] = useState("");
  const [situacaoQuery, setSituacaoQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [valuesVisible, setValuesVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDespesas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await new Promise((resolve) => setTimeout(resolve, 250));
      setDespesas(initialDespesas);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Nao foi possivel carregar as despesas.";
      setError(message);
      setDespesas([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDespesas();
  }, []);

  const filteredDespesas = useMemo(() => {
    return despesas.filter((despesa) => {
      const descricao = (despesa.descricao ?? "").toLowerCase();
      const categoria = (despesa.categoria ?? "").toLowerCase();
      const descricaoValue = descricaoQuery.trim().toLowerCase();
      const solicitaUcValue = solicitaUcQuery.trim().toLowerCase();
      const situacaoValue = situacaoQuery.trim().toLowerCase();

      const matchesDescricao =
        descricaoValue.length === 0 || descricao.includes(descricaoValue) || categoria.includes(descricaoValue);

      const matchesSolicitaUc =
        solicitaUcValue.length === 0 ||
        (solicitaUcValue === "sim" && despesa.solicitaUc) ||
        ((solicitaUcValue === "nao" || solicitaUcValue === "não") && !despesa.solicitaUc);

      const matchesSituacao =
        situacaoValue.length === 0 ||
        (situacaoValue === "ativo" && despesa.situacao === 1) ||
        (situacaoValue === "inativo" && despesa.situacao === 0);

      return matchesDescricao && matchesSolicitaUc && matchesSituacao;
    });
  }, [despesas, descricaoQuery, solicitaUcQuery, situacaoQuery]);

  const tableRows = useMemo<DespesaTableRow[]>(() => {
    return filteredDespesas.map((despesa) => ({
      ...despesa,
      solicitaUcLabel: despesa.solicitaUc ? "Sim" : "Nao",
      valorFormatado: formatCurrency(despesa.valor ?? 0),
      situacaoLabel: despesa.situacao === 1 ? "Ativo" : "Inativo",
    }));
  }, [filteredDespesas]);

  const {
    currentPage,
    pageSize,
    totalPages,
    totalRecords,
    paginatedItems,
    isPending,
    goToPage,
    changePageSize,
    resetPagination,
  } = useClientPagination(tableRows, { initialPageSize: 5 });

  useEffect(() => {
    resetPagination();
  }, [descricaoQuery, solicitaUcQuery, situacaoQuery, resetPagination]);

  const totalGastos = filteredDespesas.reduce((acc, despesa) => acc + (despesa.valor ?? 0), 0);
  const saldoDisponivel = 185000 - totalGastos;
  const balanca = saldoDisponivel - totalGastos;
  const cardValues = [saldoDisponivel, balanca, totalGastos];

  const handleCreate = async (formData: Record<string, unknown>) => {
    const payload = normalizeDespesa(formData);

    setDespesas((current) => [
      {
        id: current.length > 0 ? Math.max(...current.map((item) => item.id)) + 1 : 1,
        ...payload,
      },
      ...current,
    ]);
    setIsCreateModalOpen(false);
    showToast("Despesa cadastrada com sucesso.", "success");
  };

  const handleEdit = async (id: number, formData: Record<string, unknown>) => {
    const payload = normalizeDespesa(formData);

    setDespesas((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...payload,
            }
          : item
      )
    );

    showToast("Despesa atualizada com sucesso.", "success");
  };

  const handleDelete = async (id: number) => {
    setDespesas((current) => current.filter((item) => item.id !== id));
    showToast("Despesa removida da listagem.", "info");
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-3">
        {summaryCards.map((card, index) => (
          <div
            key={card.title}
            className={`relative overflow-hidden rounded-[22px] p-5 shadow-[0_14px_35px_rgba(0,0,0,0.12)] ${card.textClass}`}
            style={{ background: card.background }}
          >
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full border border-white/25" />
            <div className="absolute -bottom-8 right-8 h-24 w-24 rounded-full bg-white/10" />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] opacity-80">Conta digital</p>
                <h2 className="mt-5 text-[28px] font-semibold leading-none">{card.title}</h2>
                <p className="mt-2 text-sm opacity-80">{card.subtitle}</p>
              </div>
              <span className="material-symbols-outlined !text-[42px] opacity-60">{card.icon}</span>
            </div>

            <div className="relative z-10 mt-5 flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3 backdrop-blur-sm">
              <span className="tracking-[0.24em] text-lg">
                {valuesVisible ? formatCurrency(cardValues[index]) : "* * * * * *"}
              </span>
              <button
                type="button"
                aria-label={valuesVisible ? "Ocultar valores" : "Exibir valores"}
                className="cursor-pointer"
                onClick={() => setValuesVisible((previous) => !previous)}
              >
                <span className="material-symbols-outlined !text-[28px]">
                  {valuesVisible ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>

            <p className="relative z-10 mt-3 text-sm font-medium opacity-90">
              Referencia: {formatDate(filteredDespesas[0]?.data)}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-[22px] bg-[#393939] px-4 py-5 text-white shadow-[0_8px_20px_rgba(0,0,0,0.18)] sm:px-5">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[30px] font-semibold leading-none">Busca e filtros</p>
            <p className="mt-1 text-sm text-white/55">Os filtros alimentam a tabela e redefinem a pagina automaticamente.</p>
          </div>

          <Button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="!max-w-none !bg-primary-1 !px-6 !py-3 !text-base hover:!brightness-105 lg:!w-auto"
          >
            <span className="material-symbols-outlined !text-[20px]">add</span>
            Cadastrar despesa
          </Button>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-[1.5fr_1fr_1fr]">
          <Input
            value={descricaoQuery}
            onChange={(event) => setDescricaoQuery(event.target.value)}
            placeholder="Buscar por descricao ou categoria"
            className="!mb-0 !border-secundary-1 !py-3 text-sm shadow-[0_3px_10px_rgba(0,0,0,0.08)]"
            aria-label="Buscar despesas"
          />
          <Input
            value={solicitaUcQuery}
            onChange={(event) => setSolicitaUcQuery(event.target.value)}
            placeholder="Solicita UC: sim ou nao"
            className="!mb-0 !border-secundary-1 !py-3 text-sm shadow-[0_3px_10px_rgba(0,0,0,0.08)]"
            aria-label="Filtrar por solicita UC"
          />
          <Input
            value={situacaoQuery}
            onChange={(event) => setSituacaoQuery(event.target.value)}
            placeholder="Situacao: ativo ou inativo"
            className="!mb-0 !border-secundary-1 !py-3 text-sm shadow-[0_3px_10px_rgba(0,0,0,0.08)]"
            aria-label="Filtrar por situacao"
          />
        </div>
      </section>

      <section>
        <Table<DespesaTableRow>
          data={paginatedItems}
          columns={[
            { id: "id", label: "ID" },
            { id: "descricao", label: "Descricao" },
            { id: "categoria", label: "Categoria" },
            { id: "solicitaUcLabel", label: "Solicita UC" },
            { id: "valorFormatado", label: "Valor" },
            { id: "situacaoLabel", label: "Situacao" },
          ]}
          formFields={despesaFormFields}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading || isPending}
          loadingTitle="Carregando despesas"
          errorMessage={error}
          onRetry={() => void loadDespesas()}
          emptyTitle="Nenhuma despesa encontrada"
          emptyDescription="Ajuste os filtros ou cadastre uma nova despesa para preencher esta listagem."
          paginationEnabled
          pagination={{
            currentPage,
            totalPages,
            totalRecords,
            pageSize,
            pageSizeOptions: [5, 10, 15],
            onPageChange: goToPage,
            onPageSizeChange: changePageSize,
          }}
        />
      </section>

      {isCreateModalOpen ? (
        <Modal value={isCreateModalOpen} setValue={setIsCreateModalOpen}>
          <Form
            object={emptyDespesa}
            name="despesa"
            type="create"
            fields={despesaFormFields}
            onCancel={() => setIsCreateModalOpen(false)}
            onConfirm={handleCreate}
          />
        </Modal>
      ) : null}
    </div>
  );
}
