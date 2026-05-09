"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { FieldConfig } from "@/components/Table/searchbar";

import {
  normalizeOrcamentoPayload,
} from "@/global/formPayload";

import {
  getSituacaoLabel,
  SITUACAO_INATIVO,
} from "@/global/situacao";

import {
  instituicaoService,
} from "@/hooks/instituicao";

import {
  orcamentoService,
} from "@/hooks/orcamento";

import {
  tipoDespesaService,
} from "@/hooks/tipoDespesa";

import {
  buildCampos,
} from "./constants";

import {
  mapOrcamentoRows,
} from "./mapper";

export const useOrcamentosPage =
  () => {
    const [
      orcamentos,
      setOrcamentos,
    ] = useState<any[]>([]);

    const [
      filteredData,
      setFilteredData,
    ] = useState<any[]>([]);

    const [
      instituicoes,
      setInstituicoes,
    ] = useState<any[]>([]);

    const [
      tiposDespesa,
      setTiposDespesa,
    ] = useState<any[]>([]);

    const [
      campos,
      setCampos,
    ] = useState<FieldConfig[]>(
      []
    );

    const [loading, setLoading] =
      useState(true);

    const [error, setError] =
      useState<string | null>(
        null
      );

    const buildLabel = (
      label: string,
      situacao?: number
    ) => {
      if (
        situacao ===
        SITUACAO_INATIVO
      ) {
        return `${label} (${getSituacaoLabel(
          situacao
        )})`;
      }

      return label;
    };

    const instituicaoOptions =
      useMemo(
        () => {
          return instituicoes.map(
            (
              instituicao
            ) => ({
              value:
                instituicao.id,

              label:
                buildLabel(
                  instituicao.nome,
                  instituicao.situacao
                ),
            })
          );
        },
        [instituicoes]
      );

    const tipoDespesaOptions =
      useMemo(
        () => {
          return tiposDespesa.map(
            (
              tipoDespesa
            ) => ({
              value:
                tipoDespesa.id,

              label:
                buildLabel(
                  tipoDespesa.descricao,
                  tipoDespesa.situacao
                ),
            })
          );
        },
        [tiposDespesa]
      );

    const refresh =
      async () => {
        const [
          orc,
          inst,
          tipo,
        ] =
          await Promise.all([
            orcamentoService.getAll(),
            instituicaoService.getAll(),
            tipoDespesaService.getAll(),
          ]);

        const rows =
          mapOrcamentoRows(
            orc,
            inst,
            tipo
          );

        setInstituicoes(
          inst
        );

        setTiposDespesa(
          tipo
        );

        setOrcamentos(
          rows
        );

        setFilteredData(
          rows
        );
      };

    useEffect(() => {
      setCampos(
        buildCampos(
          instituicaoOptions,
          tipoDespesaOptions
        )
      );
    }, [
      instituicaoOptions,
      tipoDespesaOptions,
    ]);

    useEffect(() => {
      const load =
        async () => {
          try {
            setLoading(
              true
            );

            await refresh();

            setError(
              null
            );
          } catch (
            err
          ) {
            console.error(
              "Erro ao carregar orcamentos:",
              err
            );

            setOrcamentos(
              []
            );

            setFilteredData(
              []
            );

            setInstituicoes(
              []
            );

            setTiposDespesa(
              []
            );

            setCampos(
              []
            );

            setError(
              "Nao foi possivel carregar os orcamentos. Verifique o backend e tente novamente."
            );
          } finally {
            setLoading(
              false
            );
          }
        };

      void load();
    }, []);

    const handleCreate =
      async (
        data: any
      ) => {
        await orcamentoService.create(
          normalizeOrcamentoPayload(
            data
          )
        );

        await refresh();
      };

    const handleUpdate =
      async (
        id: number,
        data: any
      ) => {
        await orcamentoService.update(
          id,
          normalizeOrcamentoPayload(
            data
          )
        );

        await refresh();
      };

    const handleDelete =
      async (
        id: number
      ) => {
        await orcamentoService.delete(
          id
        );

        await refresh();
      };

    return {
      orcamentos,
      filteredData,

      campos,
      setCampos,

      setFilteredData,

      instituicaoOptions,
      tipoDespesaOptions,

      loading,
      error,

      handleCreate,
      handleUpdate,
      handleDelete,
    };
  };