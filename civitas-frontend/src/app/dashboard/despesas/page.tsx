"use client";

import React, { useMemo, useState } from "react";
import Modal from "@/components/modal";
import Form, { type FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import type DespesaDTO from "@/models/despesa";

type Despesa = DespesaDTO & {
  solicitaUc: boolean;
};

const initialDespesas: Despesa[] = [
  {
    id: 1,
    descricao: "Material de Escritório",
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
    descricao: "Transporte Escolar",
    valor: 3890.0,
    data: "2026-03-08",
    categoria: "Transporte",
    situacao: 1,
    solicitaUc: false,
    fornecedorId: 8,
    secretariaId: 4,
  },
  {
    id: 3,
    descricao: "Alimentação",
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
    descricao: "Manutenção Predial",
    valor: 2460.75,
    data: "2026-02-28",
    categoria: "Infraestrutura",
    situacao: 0,
    solicitaUc: false,
    fornecedorId: 11,
    secretariaId: 1,
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
    label: "Descrição",
    placeholder: "Descrição da despesa",
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
      { value: "false", label: "Não" },
    ],
  },
  {
    key: "situacao",
    label: "Situação",
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

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T00:00:00`));

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
    title: "Valor Disponível",
    subtitle: "Saldo atualmente",
    background: "linear-gradient(135deg, #0D7C7C 0%, #66B8B7 100%)",
    textClass: "text-white",
    icon: "account_balance",
  },
  {
    title: "Balança",
    subtitle: "Valor disponível - gastos totais",
    background: "linear-gradient(135deg, #1D1D1D 0%, #555555 100%)",
    textClass: "text-white",
    icon: "balance",
  },
  {
    title: "Gastos Totais",
    subtitle: "Nos últimos 30 dias",
    background: "linear-gradient(135deg, #F18B1B 0%, #FFB354 100%)",
    textClass: "text-white",
    icon: "monetization_on",
  },
];

export default function Page() {
  const [despesas, setDespesas] = useState<Despesa[]>(initialDespesas);
  const [descricaoQuery, setDescricaoQuery] = useState("");
  const [solicitaUcQuery, setSolicitaUcQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null);
  const [valuesVisible, setValuesVisible] = useState(false);

  const filteredDespesas = useMemo(() => {
    return despesas.filter((despesa) => {
      const descricao = despesa.descricao ?? "";
      const matchesDescricao =
        descricaoQuery.trim().length === 0 ||
        descricao.toLowerCase().includes(descricaoQuery.toLowerCase());

      const matchesSolicitaUc =
        solicitaUcQuery.trim().length === 0 ||
        (solicitaUcQuery.toLowerCase() === "sim" && despesa.solicitaUc) ||
        (solicitaUcQuery.toLowerCase() === "não" && !despesa.solicitaUc) ||
        (solicitaUcQuery.toLowerCase() === "nao" && !despesa.solicitaUc);

      return matchesDescricao && matchesSolicitaUc;
    });
  }, [despesas, descricaoQuery, solicitaUcQuery]);

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
  };

  const handleEdit = async (formData: Record<string, unknown>) => {
    if (!editingDespesa) return;

    const payload = normalizeDespesa(formData);
    setDespesas((current) =>
      current.map((item) =>
        item.id === editingDespesa.id
          ? {
              ...item,
              ...payload,
            }
          : item
      )
    );
    setEditingDespesa(null);
  };

  const handleDelete = (id: number) => {
    setDespesas((current) => current.filter((item) => item.id !== id));
  };

  const handleFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDescricaoQuery((current) => current.trim());
    setSolicitaUcQuery((current) => current.trim());
  };

  const clearFilters = () => {
    setDescricaoQuery("");
    setSolicitaUcQuery("");
  };

  return (
   <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-3">
        {summaryCards.map((card, index) => (
          <div
            key={card.title}
            className={`despesas-top-card relative overflow-hidden rounded-[22px] p-5 shadow-[0_14px_35px_rgba(0,0,0,0.12)] ${card.textClass}`}
            style={{ background: card.background }}
          >
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full border border-white/25" />
            <div className="absolute -bottom-8 right-8 h-24 w-24 rounded-full bg-white/10" />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] opacity-80">Conta Digital</p>
                <h2 className="mt-5 text-[28px] font-semibold leading-none">{card.title}</h2>
                <p className="mt-2 text-sm opacity-80">{card.subtitle}</p>
              </div>
              <span className="material-symbols-outlined !text-[42px] opacity-60">
                {card.icon}
              </span>
            </div>

            <div className="despesas-top-card-eyebar relative z-10 mt-5 flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3 backdrop-blur-sm">
              <span className="tracking-[0.55em] text-lg">
                {valuesVisible ? formatCurrency(cardValues[index]) : "* * * * * *"}
              </span>
              <span
                className="material-symbols-outlined !text-[28px] cursor-pointer"
                onClick={() => setValuesVisible(!valuesVisible)}
              >
                {valuesVisible ? "visibility_off" : "visibility"}
              </span>
            </div>

            <p className="relative z-10 mt-3 text-sm font-medium opacity-90">
              {valuesVisible ? formatCurrency(cardValues[index]) : "* * * * * *"}
            </p>
          </div>
        ))}
        
      </section>

      <section className="skeleton flex w-full flex-col gap-4 rounded-[24px] border border-[#E4EEF0] bg-white p-5 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
        <div>
          <p className="text-base font-semibold text-[#1F2A32]">Busca</p>
          <p className="-mt-1 text-sm text-[#8FA0A8]">Busca global + filtros avancados</p>
        </div>

        <form
          onSubmit={handleFilterSubmit}
          className="space-y-4"
          aria-label="Busca de despesas"
        >
          <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
            <input
              type="text"
              value={descricaoQuery}
              onChange={(event) => setDescricaoQuery(event.target.value)}
              placeholder="Buscar em Descricao"
              aria-label="Busca global por descricao"
              className="h-[46px] w-full flex-1 rounded-2xl border border-[#D5E3E6] bg-white px-4 text-sm text-[#1F2A32] placeholder-[#97A6AE] outline-none transition focus:border-[#58AFAE] focus:ring-4 focus:ring-[#58AFAE]/20 md:w-auto"
            />

            <div className="flex w-full flex-col gap-3 sm:flex-row md:ml-auto md:w-auto">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-[#58AFAE] px-5 font-semibold text-white transition hover:brightness-95 sm:w-auto"
              >
                <span className="material-symbols-outlined text-base text-white">add</span>
                Cadastrar
              </button>

              <button
                type="button"
                onClick={() => setShowAdvanced((current) => !current)}
                className="flex h-[46px] w-full items-center justify-center gap-2 rounded-2xl border border-[#D5E3E6] bg-white px-5 font-semibold text-[#1F2A32] transition hover:bg-[#F7FAFB] sm:w-auto"
              >
                <span className="material-symbols-outlined text-base text-[#1F2A32]">
                  filter_alt
                </span>
                {showAdvanced ? "Ocultar" : "Filtrar"}
              </button>

              <button
                type="submit"
                className="flex h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-[#004C57] px-5 font-semibold text-white transition hover:brightness-95 sm:w-auto"
              >
                <span className="material-symbols-outlined text-base text-white">search</span>
                Buscar
              </button>
            </div>
          </div>

          {showAdvanced && (
            <div className="animate-fadeIn flex flex-col gap-3 border-t border-[#E5EEF0] pt-4 md:flex-row md:items-center">
              <input
                type="text"
                value={solicitaUcQuery}
                onChange={(event) => setSolicitaUcQuery(event.target.value)}
                placeholder="Solicita UC (Sim ou Nao)"
                aria-label="Filtro por solicita UC"
                className="h-[46px] w-full flex-1 rounded-2xl border border-[#D5E3E6] bg-white px-4 text-sm text-[#1F2A32] placeholder-[#97A6AE] outline-none transition focus:border-[#58AFAE] focus:ring-4 focus:ring-[#58AFAE]/20 md:w-auto"
              />

              <button
                type="button"
                onClick={clearFilters}
                className="h-[46px] w-full rounded-2xl border border-[#D5E3E6] bg-white px-5 font-semibold text-[#1F2A32] transition hover:bg-[#F7FAFB] md:w-auto"
              >
                Limpar
              </button>
            </div>
          )}
        </form>
      </section>

      <section className="overflow-hidden rounded-[22px] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full border-collapse">
            <thead className="bg-primary-1/95 text-left text-[15px] text-[#08383F]">
              <tr>
                <th className="px-5 py-4 font-semibold">ID</th>
                <th className="px-5 py-4 font-semibold">Descrição</th>
                <th className="px-5 py-4 font-semibold">Solicita UC</th>
                <th className="px-5 py-4 font-semibold">Valor</th>
                <th className="px-5 py-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredDespesas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    Nenhuma despesa encontrada.
                  </td>
                </tr>
              ) : (
                filteredDespesas.map((despesa) => (
                  <tr key={despesa.id} className="border-b border-gray-200 last:border-b-0">
                    <td className="px-5 py-4 text-sm text-gray-700">{String(despesa.id).padStart(2, "0")}</td>
                    <td className="px-5 py-4 text-sm text-gray-800">{despesa.descricao ?? "-"}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{despesa.solicitaUc ? "Sim" : "Não"}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{formatCurrency(despesa.valor ?? 0)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingDespesa(despesa)}
                          className="text-gray-800 transition-colors hover:text-secundary-1 cursor-pointer"
                          aria-label={`Editar despesa ${despesa.descricao ?? "-"}`}
                        >
                          <span className="material-symbols-outlined !text-[20px]">edit_square</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(despesa.id)}
                          className="text-gray-800 transition-colors hover:text-red-600 cursor-pointer"
                          aria-label={`Excluir despesa ${despesa.descricao ?? "-"}`}
                        >
                          <span className="material-symbols-outlined !text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="despesas-table-footer flex flex-col gap-2 border-t border-gray-100 bg-[#FCFCFC] px-5 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>{filteredDespesas.length} despesas listadas</span>
          <span>Última atualização: {formatDate("2026-03-18")}</span>
        </div>
      </section>

      {isCreateModalOpen && (
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
      )}

      {editingDespesa && (
        <Modal value={true} setValue={() => setEditingDespesa(null)}>
          <Form
            object={{
              ...editingDespesa,
              solicitaUc: String(editingDespesa.solicitaUc),
              situacao: String(editingDespesa.situacao),
            }}
            name="despesa"
            type="edit"
            fields={despesaFormFields}
            onCancel={() => setEditingDespesa(null)}
            onConfirm={handleEdit}
          />
        </Modal>
      )}
    </div>
  );
}


