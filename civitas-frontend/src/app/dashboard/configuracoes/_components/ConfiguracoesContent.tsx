"use client";

import Table from "@/components/Table/table";
import { SkeletonTable } from "@/components/skeleton";

import {
  tipoInstituicaoColumns,
  tipoDespesaColumns,
  unidadeMedidaColumns
} from "./constants";

import {
  useConfiguracoesPage
} from "./useConfiguracoesPage";

export default function ConfiguracoesContent(){

  const {
    tipoSelecionado,
    setTipoSelecionado,
    data,
    loading
  } = useConfiguracoesPage();

  const columns =
    tipoSelecionado==="tipoInstituicao"
      ? tipoInstituicaoColumns
      : tipoSelecionado==="tipoDespesa"
      ? tipoDespesaColumns
      : unidadeMedidaColumns;

  if(loading){
    return <SkeletonTable rows={5} cols={4}/>
  }

  return(

    <div className="space-y-5">

      <div className="flex gap-2">

        <button
          onClick={()=>setTipoSelecionado("tipoInstituicao")}
        >
          Tipo Instituicao
        </button>

        <button
          onClick={()=>setTipoSelecionado("tipoDespesa")}
        >
          Tipo Despesa
        </button>

        <button
          onClick={()=>setTipoSelecionado("unidadeMedida")}
        >
          Unidade
        </button>

      </div>

      <Table
        data={data}
        columns={columns}
      />

    </div>

  );

}