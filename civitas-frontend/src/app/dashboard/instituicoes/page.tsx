"use client";

import { useEffect, useMemo, useState } from "react";
import { normalizeInstituicaoPayload } from "@/global/formPayload";
import { instituicaoService } from "@/hooks/instituicao";
import { buildFinanceRelations } from "@/lib/financeiro-relations";
import { InstituicoesErrorAlert, InstituicoesTableSection } from "./_components";
import type {
  Despesa,
  Instituicao,
  InstituicaoRow,
  InstituicaoSearchField,
  Orcamento,
  Secretaria,
  TipoInstituicao,
} from "./_types";
import { buildInstituicaoCampos, buildInstituicaoFormFields } from "./_utils/form-fields";
import {
  buildLookupLabel,
  fetchInstituicaoPageData,
  mapInstituicaoRows,
} from "./_utils/instituicoes-data";
import InstituicoesSkeleton from "./skeleton";

export default function Page() {
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [filteredData, setFilteredData] = useState<InstituicaoRow[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [tiposInstituicao, setTiposInstituicao] = useState<TipoInstituicao[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [campos, setCampos] = useState<InstituicaoSearchField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const secretariaOptions = useMemo(() => {
    return secretarias.map((secretaria) => ({
      value: secretaria.idSecretaria,
      label: buildLookupLabel(secretaria.nome, secretaria.situacao),
    }));
  }, [secretarias]);

  const tipoInstituicaoOptions = useMemo(() => {
    return tiposInstituicao.map((tipoInstituicao) => ({
      value: tipoInstituicao.id,
      label: buildLookupLabel(tipoInstituicao.descricao, tipoInstituicao.situacao),
    }));
  }, [tiposInstituicao]);

  const instituicaoFormFields = useMemo(() => {
    return buildInstituicaoFormFields(secretariaOptions, tipoInstituicaoOptions);
  }, [secretariaOptions, tipoInstituicaoOptions]);

  const relations = useMemo(() => {
    return buildFinanceRelations({
      despesas,
      instituicoes,
      secretarias,
      orcamentos,
    });
  }, [despesas, instituicoes, orcamentos, secretarias]);

  const instituicaoRows = useMemo(() => {
    return mapInstituicaoRows(
      instituicoes,
      secretarias,
      tiposInstituicao,
      relations.instituicoes
    );
  }, [instituicoes, relations.instituicoes, secretarias, tiposInstituicao]);

  const refreshInstituicoes = async () => {
    const pageData = await fetchInstituicaoPageData();

    setInstituicoes(pageData.instituicoes);
    setSecretarias(pageData.secretarias);
    setTiposInstituicao(pageData.tiposInstituicao);
    setDespesas(pageData.despesas);
    setOrcamentos(pageData.orcamentos);
  };

  useEffect(() => {
    setCampos(buildInstituicaoCampos(secretariaOptions, tipoInstituicaoOptions));
  }, [secretariaOptions, tipoInstituicaoOptions]);

  useEffect(() => {
    setFilteredData(instituicaoRows);
  }, [instituicaoRows]);

  useEffect(() => {
    const loadInstituicoes = async () => {
      try {
        setLoading(true);
        await refreshInstituicoes();
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar instituicoes:", err);
        setInstituicoes([]);
        setFilteredData([]);
        setSecretarias([]);
        setTiposInstituicao([]);
        setDespesas([]);
        setOrcamentos([]);
        setCampos([]);
        setError(
          "Nao foi possivel carregar as instituicoes. Verifique o backend e tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadInstituicoes();
  }, []);

  const handleCreate = async (data: Omit<Instituicao, "id">) => {
    await instituicaoService.create(normalizeInstituicaoPayload(data));
    await refreshInstituicoes();
  };

  const handleUpdate = async (id: number, data: Partial<Instituicao>) => {
    await instituicaoService.update(id, normalizeInstituicaoPayload(data));
    await refreshInstituicoes();
  };

  const handleDelete = async (id: number) => {
    await instituicaoService.alterarSituacao(id);
    await refreshInstituicoes();
  };

  if (loading) {
    return <InstituicoesSkeleton />;
  }

  return (
    <>
      {error && <InstituicoesErrorAlert message={error} />}

      <InstituicoesTableSection
        campos={campos}
        filteredData={filteredData}
        instituicaoRows={instituicaoRows}
        formFields={instituicaoFormFields}
        setCampos={setCampos}
        setFilteredData={setFilteredData}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </>
  );
}
