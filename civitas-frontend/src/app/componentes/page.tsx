"use client";
import React, { useState } from "react";
import Table from "@/components/Table/table";
import SearchBar from "@/components/Table/searchbar";

type User = {
  id: number;
  nome: string;
  cpf: string;
  matricula: string;
  cidade: string;
  estado: string;
  tipo: "Administrador" | "Cidadão" | "Funcionário";
};

export default function Page() {
  const usuarios: User[] = [
    { id: 1, nome: "Ana Silva", cpf: "123.456.789-00", matricula: "ADM001", cidade: "São Paulo", estado: "SP", tipo: "Administrador" },
    { id: 2, nome: "João Santos", cpf: "987.654.321-11", matricula: "CID002", cidade: "Belo Horizonte", estado: "MG", tipo: "Cidadão" },
    { id: 3, nome: "Maria Oliveira", cpf: "456.789.123-22", matricula: "FUN003", cidade: "Rio de Janeiro", estado: "RJ", tipo: "Funcionário" },
    { id: 4, nome: "Pedro Lima", cpf: "555.666.777-88", matricula: "FUN004", cidade: "São Paulo", estado: "SP", tipo: "Funcionário" },
  ];

  const [data, setData] = useState<User[]>(usuarios);

  const norm = (t: string) =>
    t.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();

  const search = (f: any) =>
    setData(
      usuarios.filter(
        (u) =>
          norm(u.nome).includes(norm(f.nome)) &&
          norm(u.cpf).includes(norm(f.cpf)) &&
          norm(u.cidade).includes(norm(f.cidade)) &&
          norm(u.estado).includes(norm(f.estado)) &&
          (f.tipo ? u.tipo === f.tipo : true)
      )
    );

  return (
    <div className="flex flex-col items-center justify-start w-screen min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#004D4D] mb-2">
          Listagem de Cadastros
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mb-6">
          Home &lt; Cadastros &lt; Listagem
        </p>

        <div className="flex flex-col gap-6">
          <SearchBar onSearch={search} />
          <Table data={data} />
        </div>
      </div>
    </div>
  );
}
