"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  normalizeSecretariaPayload,
} from "@/global/formPayload";

import {
  secretariaService,
} from "@/hooks/secretaria";

import {
  camposConst,
} from "./constants";

import {
  mapSecretariaRows,
} from "./mapper";

export const useSecretariaPage =
  () => {
    const [
      secretarias,
      setSecretarias,
    ] = useState<any[]>([]);

    const [
      filteredData,
      setFilteredData,
    ] = useState<any[]>([]);

    const [
      campos,
      setCampos,
    ] = useState(
      camposConst
    );

    const [loading, setLoading] =
      useState(true);

    const [error, setError] =
      useState<string | null>(
        null
      );

    const refresh =
      async () => {
        const items =
          await secretariaService.getAll();

        const rows =
          mapSecretariaRows(
            items
          );

        setSecretarias(
          rows
        );

        setFilteredData(
          rows
        );
      };

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
              err
            );

            setError(
              "Nao foi possivel carregar as secretarias. Verifique o backend e tente novamente."
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
        await secretariaService.create(
          normalizeSecretariaPayload(
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
        await secretariaService.update(
          id,
          normalizeSecretariaPayload(
            data
          )
        );

        await refresh();
      };

    const handleDelete =
      async (
        id: number
      ) => {
        await secretariaService.alterarSituacao(
          id
        );

        await refresh();
      };

    return {
      secretarias,
      filteredData,

      campos,
      setCampos,

      setFilteredData,

      loading,
      error,

      handleCreate,
      handleUpdate,
      handleDelete,
    };
  };