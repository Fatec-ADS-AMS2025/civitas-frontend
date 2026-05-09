"use client";

import { useCallback, useEffect, useState } from "react";
import type { FieldConfig } from "@/components/Table/searchbar";
import { normalizeSecretariaPayload } from "@/global/formPayload";
import { getSituacaoLabel } from "@/global/situacao";
import { secretariaService } from "@/hooks/secretaria";
import type SecretariaDTO from "@/models/secretaria";

export type Secretaria = SecretariaDTO;
export type SecretariaRow = Secretaria & { situacaoLabel: string };

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Nao foi possivel carregar as secretarias. Verifique o backend e tente novamente.";
};

const mapSecretariaRows = (items: Secretaria[]): SecretariaRow[] => {
  return items.map((item) => ({
    ...item,
    situacaoLabel: getSituacaoLabel(item.situacao),
  }));
};

export function useSecretariaPage(initialFields: FieldConfig[]) {
  const [secretarias, setSecretarias] = useState<SecretariaRow[]>([]);
  const [filteredData, setFilteredData] = useState<SecretariaRow[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(initialFields);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSecretarias = useCallback(async () => {
    const items = await secretariaService.getAll();
    const rows = mapSecretariaRows(items);

    setSecretarias(rows);
    setFilteredData(rows);
  }, []);

  useEffect(() => {
    const loadSecretarias = async () => {
      try {
        setLoading(true);
        await refreshSecretarias();
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar secretarias:", err);
        setSecretarias([]);
        setFilteredData([]);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void loadSecretarias();
  }, [refreshSecretarias]);

  const handleCreate = async (data: Omit<Secretaria, "idSecretaria">) => {
    await secretariaService.create(normalizeSecretariaPayload(data));
    await refreshSecretarias();
  };

  const handleUpdate = async (id: number, data: Partial<Secretaria>) => {
    await secretariaService.update(id, normalizeSecretariaPayload(data));
    await refreshSecretarias();
  };

  const handleDelete = async (id: number) => {
    await secretariaService.alterarSituacao(id);
    await refreshSecretarias();
  };

  return {
    secretarias,
    filteredData,
    campos,
    setFilteredData,
    setCampos,
    loading,
    error,
    refreshSecretarias,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
