"use client";
import React, { useState } from "react";

type Orcamento = {
  id: number;
  ano: number;
  valor: string;
};

const OrcamentosPage = () => {
  const orcamentos: Orcamento[] = [
    {
      id: 100,
      ano: 2021,
      valor: "R$ 21.500",
    },
    {
      id: 101,
      ano: 2022,
      valor: "R$ 25.000",
    },
    {
      id: 102,
      ano: 2023,
      valor: "R$ 30.000",
    },
    {
      id: 103,
      ano: 2024,
      valor: "R$ 35.500",
    },
    {
      id: 104,
      ano: 2025,
      valor: "R$ 40.000",
    },
  ];

  const [filteredData, setFilteredData] = useState<Orcamento[]>(orcamentos);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalAction, setModalAction] = useState<string | null>(null);
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = orcamentos.filter((o) =>
      o.id.toString().includes(value) ||
      o.ano.toString().includes(value) ||
      o.valor.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const openModal = (action: string, orcamento: Orcamento) => {
    setSelectedOrcamento(orcamento);
    setModalAction(action);
  };

  const closeModal = () => {
    setModalAction(null);
    setSelectedOrcamento(null);
  };

  const displayedOrcamentos = filteredData.slice(0, 10);

  return (
    <main className="p-6 bg-transparent min-h-screen">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-[#004D4D]">Listagem de Orçamento</h1>
        <p className="text-sm text-gray-500 mt-1">Home &lt; Cadastros &lt; Listagem</p>
      </div>

      {/* Barra de busca */}
      <div className="bg-[#393939] rounded-2xl p-5 shadow-lg w-full flex flex-col gap-4 mb-6">
        <div>
          <p className="text-white text-base">Busca:</p>
          <p className="text-sm text-gray-400 -mt-1">Aqui você busca e filtra</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
          <input
            type="text"
            placeholder="Orçamento"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="rounded-full px-4 py-2 text-sm max-w-md md:w-auto flex-1 outline-none bg-white text-black placeholder-gray-500"
          />

          <div className="flex flex-col sm:flex-row gap-3 md:ml-auto w-full md:w-auto">
            <button
              onClick={() => alert("Levar para a tela de cadastro")}
              className="bg-primary-1 hover:bg-primary-1/80 text-white font-semibold px-5 py-2 rounded-full flex items-center justify-center gap-2 transition w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-white text-base">add</span>
              Orçamento
            </button>

            <button
              onClick={() => alert("Filtrar")}
              className="border border-gray-400 hover:bg-gray-700 text-white font-semibold px-5 py-2 rounded-full flex items-center justify-center gap-2 transition w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-white text-base">filter_alt</span>
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Orçamentos - Desktop */}
      <div className="w-full bg-white rounded-xl shadow-md overflow-hidden">
        <div className="hidden md:block">
          <div className="max-h-[400px] overflow-y-auto relative">
            <table className="w-full text-left border-collapse text-black">
              <thead className="bg-primary-1 text-black sticky top-0 z-10">
                <tr>
                  <th className="p-3">ID Orçamento</th>
                  <th className="p-3">Ano</th>
                  <th className="p-3">Valor</th>
                  <th className="p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {displayedOrcamentos.length > 0 ? (
                  displayedOrcamentos.map((orcamento) => (
                    <tr
                      key={orcamento.id}
                      className="border-b last:border-none hover:bg-gray-100 transition"
                    >
                      <td className="p-3 text-black">{orcamento.id}</td>
                      <td className="p-3 text-black">{orcamento.ano}</td>
                      <td className="p-3 text-black">{orcamento.valor}</td>
                      <td className="p-3 flex gap-2">
                        <button
                          title="Ver"
                          onClick={() => openModal("Ver", orcamento)}
                          className="hover:scale-110 transition"
                        >
                          <span className="material-symbols-outlined text-black">
                            visibility
                          </span>
                        </button>

                        <button
                          title="Editar"
                          onClick={() => openModal("Editar", orcamento)}
                          className="hover:scale-110 transition"
                        >
                          <span className="material-symbols-outlined text-black">
                            edit_square
                          </span>
                        </button>

                        <button
                          title="Excluir"
                          onClick={() => openModal("Excluir", orcamento)}
                          className="hover:scale-110 transition"
                        >
                          <span className="material-symbols-outlined text-black">
                            delete
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-3 text-center text-gray-500">
                      Nenhum orçamento encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cards - Mobile */}
        <div className="md:hidden flex flex-col divide-y">
          {displayedOrcamentos.length > 0 ? (
            displayedOrcamentos.map((orcamento) => (
              <div key={orcamento.id} className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-secondary-1">
                    ID: {orcamento.id}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">Ano: {orcamento.ano}</p>
                <p className="text-sm text-gray-600">Valor: {orcamento.valor}</p>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => openModal("Ver", orcamento)}
                    className="hover:scale-110 transition"
                  >
                    <span className="material-symbols-outlined text-black">
                      visibility
                    </span>
                  </button>
                  <button
                    onClick={() => openModal("Editar", orcamento)}
                    className="hover:scale-110 transition"
                  >
                    <span className="material-symbols-outlined text-black">
                      edit_square
                    </span>
                  </button>
                  <button
                    onClick={() => openModal("Excluir", orcamento)}
                    className="hover:scale-110 transition"
                  >
                    <span className="material-symbols-outlined text-black">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              Nenhum orçamento encontrado
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalAction && selectedOrcamento && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-80 md:w-96 text-center relative transform transition-all duration-300 scale-100 animate-slideUp">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 className="text-2xl font-bold text-secondary-1 mb-2">
              {modalAction} Orçamento
            </h2>

            <p className="text-gray-600 mb-2">ID: {selectedOrcamento.id}</p>
            <p className="text-gray-600 mb-5">Ano: {selectedOrcamento.ano}</p>

            <button
              onClick={closeModal}
              className="bg-primary-1 hover:bg-secondary-1/80 text-white px-5 py-2 rounded-full font-semibold transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default OrcamentosPage;
