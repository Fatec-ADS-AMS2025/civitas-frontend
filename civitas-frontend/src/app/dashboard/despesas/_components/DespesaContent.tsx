"use client";

import React from "react";

type DespesaContentProps = {
  data: any[];
  loading: boolean;
  onEdit: (item: any) => void;
  onView: (item: any) => void;
  onDelete: (item: any) => void;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
};

export function DespesaContent({
  data,
  loading,
  onEdit,
  onView,
  onDelete,
}: DespesaContentProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-xl bg-gray-200"
          />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
        Nenhuma despesa encontrada.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-[#E0ECEE] bg-white shadow-sm">
      <div className="border-b border-[#E8F0F1] px-6 py-5">
        <h2 className="text-3xl font-bold text-[#0B4D57]">
          Listagem de despesas
        </h2>

        <p className="mt-2 text-sm text-[#71868D]">
          Visualize, edite e gerencie as despesas cadastradas.
        </p>
      </div>

      <div className="overflow-x-auto p-6">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-[#8CA0A6]">
              <th className="px-4 py-2">Registro</th>
              <th className="px-4 py-2">Categoria</th>
              <th className="px-4 py-2">Descrição</th>
              <th className="px-4 py-2">Valor</th>
              <th className="px-4 py-2">Situação</th>
              <th className="px-4 py-2 text-center">Ações</th>
            </tr>
          </thead>

          <tbody>
            {data.map((despesa) => (
              <tr
                key={despesa.id}
                className="rounded-2xl bg-white shadow-sm ring-1 ring-[#E2EFF1]"
              >
                <td className="rounded-l-2xl px-4 py-5">
                  <span className="rounded-full bg-[#F7D447] px-4 py-2 text-sm font-bold text-[#272727]">
                    {despesa.registro}
                  </span>
                </td>

                <td className="px-4 py-5 text-sm font-semibold text-[#34464D]">
                  {despesa.categoria}
                </td>

                <td className="px-4 py-5 text-sm text-[#4F646C]">
                  {despesa.descricao}
                </td>

                <td className="px-4 py-5 text-sm font-semibold text-[#204C58]">
                  {formatCurrency(despesa.valor)}
                </td>

                <td className="px-4 py-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      despesa.situacao === 1
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {despesa.situacaoLabel}
                  </span>
                </td>

                <td className="rounded-r-2xl px-4 py-5">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onView(despesa)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        visibility
                      </span>
                    </button>

                    <button
                      onClick={() => onEdit(despesa)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        edit
                      </span>
                    </button>

                    <button
                      onClick={() => onDelete(despesa)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 text-red-500"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}