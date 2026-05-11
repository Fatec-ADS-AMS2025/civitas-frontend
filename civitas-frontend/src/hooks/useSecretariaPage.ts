"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FieldConfig } from "@/components/Table/searchbar";
import { normalizeSecretariaPayload } from "@/global/formPayload";
import { getSituacaoLabel } from "@/global/situacao";
import { instituicaoService } from "@/hooks/instituicao";
import { secretariaService } from "@/hooks/secretaria";
import type InstituicaoDTO from "@/models/instituicao";
import type SecretariaDTO from "@/models/secretaria";

export type Secretaria = SecretariaDTO;
export type SecretariaRow = Secretaria & {
  situacaoLabel: string;
  totalInstituicoes: number;
  instituicoesRelacionadas: InstituicaoDTO[];
};

export type SecretariaCardFilter =
  | { type: "all" }
  | { type: "withInstituicoes" }
  | { type: "withoutInstituicoes" }
  | { type: "secretaria"; idSecretaria: number };

export type SecretariaMetrics = {
  totalSecretarias: number;
  totalInstituicoes: number;
  secretariasComInstituicoes: number;
  secretariasSemInstituicoes: number;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Nao foi possivel carregar as secretarias. Verifique o backend e tente novamente.";
};

const loadInstituicoesSafely = async (): Promise<InstituicaoDTO[]> => {
  try {
    return await instituicaoService.getAll();
  } catch (error) {
    console.error("Erro ao carregar instituicoes vinculadas as secretarias:", error);
    return [];
  }
};

const mapSecretariaRows = (
  items: Secretaria[],
  instituicoes: InstituicaoDTO[]
): SecretariaRow[] => {
  return items.map((item) => {
    const instituicoesRelacionadas = instituicoes.filter(
      (instituicao) => instituicao.idSecretaria === item.idSecretaria
    );

    return {
      ...item,
      situacaoLabel: getSituacaoLabel(item.situacao),
      instituicoesRelacionadas,
      totalInstituicoes: instituicoesRelacionadas.length,
    };
  });
};

export function useSecretariaPage(initialFields: FieldConfig[]) {
  const [secretarias, setSecretarias] = useState<SecretariaRow[]>([]);
  const [filteredData, setFilteredData] = useState<SecretariaRow[]>([]);
  const [instituicoes, setInstituicoes] = useState<InstituicaoDTO[]>([]);
  const [cardFilter, setCardFilter] = useState<SecretariaCardFilter>({ type: "all" });
  const [campos, setCampos] = useState<FieldConfig[]>(initialFields);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSecretarias = useCallback(async () => {
    const [items, instituicoesItems] = await Promise.all([
      secretariaService.getAll(),
      loadInstituicoesSafely(),
    ]);
    const rows = mapSecretariaRows(items, instituicoesItems);

    setInstituicoes(instituicoesItems);
    setSecretarias(rows);
    setFilteredData(rows);
  }, []);

  const cardFilteredSecretarias = useMemo(() => {
    switch (cardFilter.type) {
      case "withInstituicoes":
        return secretarias.filter((secretaria) => secretaria.totalInstituicoes > 0);
      case "withoutInstituicoes":
        return secretarias.filter((secretaria) => secretaria.totalInstituicoes === 0);
      case "secretaria":
        return secretarias.filter(
          (secretaria) => secretaria.idSecretaria === cardFilter.idSecretaria
        );
      case "all":
      default:
        return secretarias;
    }
  }, [cardFilter, secretarias]);

  const secretariaMetrics = useMemo<SecretariaMetrics>(() => {
    const totalSecretarias = secretarias.length;
    const totalInstituicoes = instituicoes.length;
    const secretariasComInstituicoes = secretarias.filter(
      (secretaria) => secretaria.totalInstituicoes > 0
    ).length;
    const secretariasSemInstituicoes = secretarias.filter(
      (secretaria) => secretaria.totalInstituicoes === 0
    ).length;

    return {
      totalSecretarias,
      totalInstituicoes,
      secretariasComInstituicoes,
      secretariasSemInstituicoes,
    };
  }, [instituicoes, secretarias]);

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
        setInstituicoes([]);
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
    cardFilteredSecretarias,
    instituicoes,
    secretariaMetrics,
    cardFilter,
    campos,
    setFilteredData,
    setCardFilter,
    setCampos,
    loading,
    error,
    refreshSecretarias,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
