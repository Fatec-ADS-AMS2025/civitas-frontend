"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FieldConfig } from "@/components/Table/searchbar";
import type TipoCodigoDTO from "@/models/tipoCodigo";
import type UnidadeMedidaDTO from "@/models/unidadeMedida";
import { CONFIG_DEFINITIONS } from "./configuracoes.constants";
import { configuracoesService } from "./configuracoes.service";
import type { ConfigKind, ConfigRow, FeedbackState } from "./configuracoes.types";
import { asErrorMessage } from "./configuracoes.utils";

export const useConfiguracoes = () => {
  const [tipoSelecionado, setTipoSelecionado] =
    useState<ConfigKind>("tipoInstituicao");
  const [campos, setCampos] = useState<FieldConfig[]>(
    CONFIG_DEFINITIONS.tipoInstituicao.buildSearchFields()
  );
  const [dadosOriginais, setDadosOriginais] = useState<ConfigRow[]>([]);
  const [dadosFiltrados, setDadosFiltrados] = useState<ConfigRow[]>([]);
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadeMedidaDTO[]>([]);
  const [tipoCodigos, setTipoCodigos] = useState<TipoCodigoDTO[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [loading, setLoading] = useState(true);

  const definition = useMemo(
    () => CONFIG_DEFINITIONS[tipoSelecionado],
    [tipoSelecionado]
  );

  const formFields = useMemo(
    () => definition.buildFields(unidadesMedida, tipoCodigos),
    [definition, tipoCodigos, unidadesMedida]
  );

  const refreshData = useCallback(async (selectedKind: ConfigKind) => {
    setLoading(true);

    try {
      if (selectedKind === "tipoDespesa") {
        const lookups = await configuracoesService.getTipoDespesaLookups();
        setUnidadesMedida(lookups.unidadesMedida);
        setTipoCodigos(lookups.tipoCodigos);
      }

      const rows = await configuracoesService.getRows(selectedKind);
      setDadosOriginais(rows);
      setDadosFiltrados(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCampos(definition.buildSearchFields());
  }, [definition]);

  useEffect(() => {
    const load = async () => {
      setFeedback(null);

      try {
        await refreshData(tipoSelecionado);
      } catch (error) {
        setDadosOriginais([]);
        setDadosFiltrados([]);
        setFeedback({
          type: "error",
          message: asErrorMessage(
            error,
            "Nao foi possivel carregar os dados de configuracoes."
          ),
        });
      }
    };

    void load();
  }, [refreshData, tipoSelecionado]);

  const handleCreate = useCallback(
    async (formData: Record<string, unknown>) => {
      setFeedback(null);

      try {
        const message = await configuracoesService.create(tipoSelecionado, formData);
        setFeedback({ type: "success", message });
        await refreshData(tipoSelecionado);
      } catch (error) {
        setFeedback({
          type: "error",
          message: asErrorMessage(error, "Nao foi possivel cadastrar o registro."),
        });
        throw error;
      }
    },
    [refreshData, tipoSelecionado]
  );

  const handleUpdate = useCallback(
    async (id: number, formData: Record<string, unknown>) => {
      setFeedback(null);

      try {
        const message = await configuracoesService.update(
          tipoSelecionado,
          id,
          formData
        );
        setFeedback({ type: "success", message });
        await refreshData(tipoSelecionado);
      } catch (error) {
        setFeedback({
          type: "error",
          message: asErrorMessage(error, "Nao foi possivel atualizar o registro."),
        });
        throw error;
      }
    },
    [refreshData, tipoSelecionado]
  );

  const handleToggleSituacao = useCallback(
    async (id: number) => {
      setFeedback(null);

      try {
        const message = await configuracoesService.toggleSituacao(
          tipoSelecionado,
          id
        );
        setFeedback({ type: "success", message });
        await refreshData(tipoSelecionado);
      } catch (error) {
        setFeedback({
          type: "error",
          message: asErrorMessage(
            error,
            "Nao foi possivel alterar a situacao. Verifique se existe vinculo ativo."
          ),
        });
        throw error;
      }
    },
    [refreshData, tipoSelecionado]
  );

  return {
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
  };
};
