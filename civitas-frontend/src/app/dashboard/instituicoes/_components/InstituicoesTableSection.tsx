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
import InstituicaoDetailsView from "./InstituicaoDetailsView";

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
        renderModalExtra={(row, mode) =>
          mode === "view" ? <InstituicaoDetailsView instituicao={row} /> : null
        }
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
