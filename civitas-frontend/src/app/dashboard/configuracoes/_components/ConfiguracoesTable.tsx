"use client";

import Table from "@/components/Table/table";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import { CONFIG_FORM_HIDDEN_FIELDS } from "./configuracoes.constants";
import type { ConfigDefinition, ConfigRow } from "./configuracoes.types";

type ConfiguracoesTableProps = {
  definition: ConfigDefinition;
  dadosFiltrados: ConfigRow[];
  dadosOriginais: ConfigRow[];
  formFields: ModalFieldConfig[];
  onUpdate: (id: number, formData: Record<string, unknown>) => Promise<void>;
  onToggleSituacao: (id: number) => Promise<void>;
};

export default function ConfiguracoesTable({
  definition,
  dadosFiltrados,
  dadosOriginais,
  formFields,
  onUpdate,
  onToggleSituacao,
}: ConfiguracoesTableProps) {
  const statusColumn = definition.columns.find((column) => column.id === "situacaoLabel");
  const titleColumn =
    definition.columns.find((column) => column.id === "descricao") ??
    definition.columns.find((column) => column.id === "nome") ??
    definition.columns[0];

  return (
    <Table
      data={dadosFiltrados}
      columns={definition.columns}
      onEdit={onUpdate}
      onDelete={onToggleSituacao}
      formFields={formFields}
      formHiddenFields={CONFIG_FORM_HIDDEN_FIELDS}
      displayMode="cards"
      cardConfig={{
        icon: "tune",
        tone: "slate",
        eyebrow: definition.label,
        title: (row) => {
          const record = row as unknown as Record<string, unknown>;
          return titleColumn ? String(record[titleColumn.id] ?? "Registro") : "Registro";
        },
        badgeColumnId: statusColumn?.id,
        primaryFields: definition.columns
          .filter((column) => column.id !== statusColumn?.id && column.id !== titleColumn?.id)
          .map((column) => ({
            label: column.label,
            columnId: column.id,
            icon: column.id.toLowerCase().includes("unidade") ? "straighten" : "label",
          })),
        gridClassName: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
      }}
      exportConfig={{
        enabled: true,
        title: definition.label,
        fileName: definition.key,
        allData: dadosOriginais,
      }}
    />
  );
}
