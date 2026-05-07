"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { FieldConfig } from "@/components/Table/searchbar";

import {
  normalizeInstituicaoPayload,
} from "@/global/formPayload";

import {
  instituicaoService,
} from "@/hooks/instituicao";

import {
  secretariaService,
} from "@/hooks/secretaria";

import {
  tipoInstituicaoService,
} from "@/hooks/tipoInstituicao";

import {
  buildInstituicaoCampos,
} from "./constants";

import {
  buildLookupLabel,
  mapInstituicaoRows,
} from "./mapper";

export const useInstituicoesPage =
  () => {
    const [
      instituicoes,
      setInstituicoes,
    ] = useState<any[]>([]);

    const [
      filteredData,
      setFilteredData,
    ] = useState<any[]>([]);

    const [
      secretarias,
      setSecretarias,
    ] = useState<any[]>([]);

    const [
      tiposInstituicao,
      setTiposInstituicao,
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

    const secretariaOptions =
      useMemo(
        () => {
          return secretarias.map(
            (
              secretaria
            ) => ({
              value:
                secretaria.idSecretaria,

              label:
                buildLookupLabel(
                  secretaria.nome,
                  secretaria.situacao
                ),
            })
          );
        },
        [secretarias]
      );

    const tipoInstituicaoOptions =
      useMemo(
        () => {
          return tiposInstituicao.map(
            (tipo) => ({
              value:
                tipo.id,

              label:
                buildLookupLabel(
                  tipo.descricao,
                  tipo.situacao
                ),
            })
          );
        },
        [tiposInstituicao]
      );

    const refresh =
      async () => {
        const [
          inst,
          sec,
          tipo,
        ] =
          await Promise.all([
            instituicaoService.getAll(),
            secretariaService.getAll(),
            tipoInstituicaoService.getAll(),
          ]);

        const rows =
          mapInstituicaoRows(
            inst,
            sec,
            tipo
          );

        setSecretarias(
          sec
        );

        setTiposInstituicao(
          tipo
        );

        setInstituicoes(
          rows
        );

        setFilteredData(
          rows
        );
      };

    useEffect(() => {
      setCampos(
        buildInstituicaoCampos(
          secretariaOptions,
          tipoInstituicaoOptions
        )
      );
    }, [
      secretariaOptions,
      tipoInstituicaoOptions,
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
              "Erro ao carregar instituicoes:",
              err
            );

            setInstituicoes(
              []
            );

            setFilteredData(
              []
            );

            setSecretarias(
              []
            );

            setTiposInstituicao(
              []
            );

            setCampos(
              []
            );

            setError(
              "Nao foi possivel carregar as instituicoes. Verifique o backend e tente novamente."
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
        await instituicaoService.create(
          normalizeInstituicaoPayload(
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
        await instituicaoService.update(
          id,
          normalizeInstituicaoPayload(
            data
          )
        );

        await refresh();
      };

    const handleDelete =
      async (
        id: number
      ) => {
        await instituicaoService.alterarSituacao(
          id
        );

        await refresh();
      };

    return {
      instituicoes,
      filteredData,

      campos,
      setCampos,

      setFilteredData,

      secretariaOptions,
      tipoInstituicaoOptions,

      loading,
      error,

      handleCreate,
      handleUpdate,
      handleDelete,
    };
  };