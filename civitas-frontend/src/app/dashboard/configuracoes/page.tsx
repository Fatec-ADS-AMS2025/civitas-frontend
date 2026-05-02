"use client";

import {
  ConfiguracoesFeedback,
  ConfiguracoesSearch,
  ConfiguracoesTable,
  ConfiguracoesTipoSelector,
  useConfiguracoes,
} from "./_components";
import ConfiguracoesSkeleton from "./skeleton";

export default function ConfiguracoesPage() {
  const {
    tipoSelecionado,
    setTipoSelecionado,
    campos,
    setCampos,
    dadosOriginais,
    dadosFiltrados,
    setDadosFiltrados,
    feedback,
    loading,
    definition,
    formFields,
    handleCreate,
    handleUpdate,
    handleToggleSituacao,
  } = useConfiguracoes();

  if (loading) {
    return <ConfiguracoesSkeleton />;
  }

  return (
    <div className="space-y-5">
      <ConfiguracoesFeedback feedback={feedback} />

      <ConfiguracoesSearch
        definition={definition}
        dadosOriginais={dadosOriginais}
        setDadosFiltrados={setDadosFiltrados}
        campos={campos}
        setCampos={setCampos}
        formFields={formFields}
        onCreate={handleCreate}
      />

      <ConfiguracoesTipoSelector
        selected={tipoSelecionado}
        onSelect={setTipoSelecionado}
      />

      <ConfiguracoesTable
        definition={definition}
        dadosFiltrados={dadosFiltrados}
        dadosOriginais={dadosOriginais}
        formFields={formFields}
        onUpdate={handleUpdate}
        onToggleSituacao={handleToggleSituacao}
      />
    </div>
  );
}
