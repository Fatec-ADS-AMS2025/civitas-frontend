"use client";

import type { Dispatch, SetStateAction } from "react";
import { SearchBar, type FieldConfig } from "@/components/Table/searchbar";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import { CONFIG_FORM_HIDDEN_FIELDS } from "./configuracoes.constants";
import type { ConfigDefinition, ConfigRow } from "./configuracoes.types";

type ConfiguracoesSearchProps = {
  definition: ConfigDefinition;
  dadosOriginais: ConfigRow[];
  setDadosFiltrados: Dispatch<SetStateAction<ConfigRow[]>>;
  campos: FieldConfig[];
  formFields: ModalFieldConfig[];
  onCreate: (formData: Record<string, unknown>) => Promise<void>;
};

export default function ConfiguracoesSearch({
  definition,
  dadosOriginais,
  setDadosFiltrados,
  campos,
  formFields,
  onCreate,
}: ConfiguracoesSearchProps) {
  return (
    <SearchBar
      model={definition.emptyModel}
      dados={dadosOriginais}
      setDados={setDadosFiltrados}
      campos={campos}
      onCadastrar={onCreate}
      formFields={formFields}
      formHiddenFields={CONFIG_FORM_HIDDEN_FIELDS}
    />
  );
}
