"use client";

import type { Dispatch, SetStateAction } from "react";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import { SearchBar } from "@/components/Table/searchbar";
import type { FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import {
  INSTITUICOES_COLUMNS,
  NOVA_INSTITUICAO,
} from "../_constants/instituicoes";
import type { Instituicao, InstituicaoRow } from "../_types";

type InstituicoesTableSectionProps = {
  campos: FieldConfig[];
  filteredData: InstituicaoRow[];
  instituicaoRows: InstituicaoRow[];
  formFields: ModalFieldConfig[];
  setCampos: Dispatch<SetStateAction<FieldConfig[]>>;
  setFilteredData: Dispatch<SetStateAction<InstituicaoRow[]>>;
  onCreate: (data: Omit<Instituicao, "id">) => Promise<void>;
  onUpdate: (id: number, data: Partial<Instituicao>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export default function InstituicoesTableSection({
  campos,
  filteredData,
  instituicaoRows,
  formFields,
  setCampos,
  setFilteredData,
  onCreate,
  onUpdate,
  onDelete,
}: InstituicoesTableSectionProps) {
  return (
    <>
      <SearchBar
        model={NOVA_INSTITUICAO}
        dados={instituicaoRows}
        setDados={setFilteredData}
        campos={campos}
        setCampos={setCampos}
        onCadastrar={onCreate}
        formFields={formFields}
        formHiddenFields={["id"]}
      />

      <Table
        data={filteredData}
        columns={INSTITUICOES_COLUMNS}
        onEdit={onUpdate}
        onDelete={onDelete}
        formFields={formFields}
        formHiddenFields={["id"]}
        displayMode="cards"
        cardConfig={{
          icon: "account_balance",
          tone: "teal",
          eyebrow: (row) => `Instituicao #${String(row.id).padStart(3, "0")}`,
          title: (row) => row.nome || "Instituicao sem nome",
          subtitle: (row) => row.secretariaLabel,
          badgeColumnId: "situacaoLabel",
          primaryFields: [
            { label: "Tipo", columnId: "tipoInstituicaoLabel", icon: "domain" },
            { label: "Gastos", columnId: "totalGastosFormatado", icon: "payments", tone: "amber" },
            { label: "Saldo", columnId: "saldoFormatado", icon: "savings", tone: "success" },
          ],
          relationshipFields: [
            { label: "Secretaria", columnId: "secretariaLabel", icon: "corporate_fare" },
            { label: "Despesas", columnId: "quantidadeDespesas", icon: "receipt_long" },
            { label: "Codigos", columnId: "quantidadeCodigos", icon: "qr_code_2" },
          ],
        }}
        exportConfig={{
          enabled: true,
          title: "Instituicoes",
          fileName: "instituicoes",
          allData: instituicaoRows,
        }}
        paginationEnabled={false}
      />
    </>
  );
}
