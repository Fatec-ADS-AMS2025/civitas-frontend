"use client";

import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import Table from "@/components/Table/table";
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
  return (
    <Table
      data={dadosFiltrados}
      columns={definition.columns}
      onEdit={onUpdate}
      onDelete={onToggleSituacao}
      formFields={formFields}
      formHiddenFields={CONFIG_FORM_HIDDEN_FIELDS}
      exportConfig={{
        enabled: true,
        title: definition.label,
        fileName: definition.key,
        allData: dadosOriginais,
      }}
    />
  );
}
