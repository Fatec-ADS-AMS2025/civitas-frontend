"use client";

import { useEffect, useState } from "react";

import { tipoInstituicaoService } from "@/hooks/tipoInstituicao";
import { tipoDespesaService } from "@/hooks/tipoDespesa";
import { unidadeMedidaService } from "@/hooks/unidadeMedida";

import {
  ConfigKind
} from "./constants";

import {
  mapRows,
  mergeById
} from "./mapper";

export function useConfiguracoesPage() {

  const [tipoSelecionado,setTipoSelecionado] =
    useState<ConfigKind>("tipoInstituicao");

  const [data,setData] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);

  const load = async ()=>{

    setLoading(true);

    try{

      if(tipoSelecionado==="tipoInstituicao"){

        const [ativos,inativos] =
          await Promise.all([
            tipoInstituicaoService.getAll(),
            tipoInstituicaoService.getInactive()
          ]);

        setData(
          mapRows(
            mergeById(ativos,inativos)
          )
        );
      }

      if(tipoSelecionado==="tipoDespesa"){

        const [ativos,inativos] =
          await Promise.all([
            tipoDespesaService.getAll(),
            tipoDespesaService.getInactive()
          ]);

        setData(
          mapRows(
            mergeById(ativos,inativos)
          )
        );
      }

      if(tipoSelecionado==="unidadeMedida"){

        const [ativos,inativos] =
          await Promise.all([
            unidadeMedidaService.getAll(),
            unidadeMedidaService.getInactive()
          ]);

        setData(
          mapRows(
            mergeById(ativos,inativos)
          )
        );
      }

    } finally{
      setLoading(false);
    }

  };

  useEffect(()=>{
    void load();
  },[tipoSelecionado]);

  return {
    tipoSelecionado,
    setTipoSelecionado,
    data,
    loading,
    reload:load
  };
}