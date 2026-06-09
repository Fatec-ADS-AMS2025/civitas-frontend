"use client";

import { useEffect, useMemo, useState } from "react";
import { normalizeInstituicaoPayload } from "@/global/formPayload";
import { instituicaoService } from "@/hooks/instituicao";
import { buildFinanceRelations } from "@/lib/financeiro-relations";
import { InstituicoesErrorAlert, InstituicoesTableSection } from ".";
import type {
  Despesa,
  Instituicao,
  InstituicaoRow,
  InstituicaoSearchField,
  Orcamento,
  Secretaria,
  TipoInstituicao,
} from "../_types";
import { buildInstituicaoCampos, buildInstituicaoFormFields } from "../_utils/form-fields";
import {
  buildLookupLabel,
  fetchInstituicaoPageData,
  mapInstituicaoRows,
} from "../_utils/instituicoes-data";

type InstituicaoPageData = Awaited<ReturnType<typeof fetchInstituicaoPageData>>;

type InstituicoesPageClientProps = {
  initialData: InstituicaoPageData;
  initialError?: string | null;
};

export default function InstituicoesPageClient({
  initialData,
  initialError = null,
}: InstituicoesPageClientProps) {
  const initialRelations = buildFinanceRelations({
    despesas: initialData.despesas,
    instituicoes: initialData.instituicoes,
    secretarias: initialData.secretarias,
    orcamentos: initialData.orcamentos,
  });
  const initialRows = mapInstituicaoRows(
    initialData.instituicoes,
    initialData.secretarias,
    initialData.tiposInstituicao,
    initialRelations.instituicoes
  );
  const initialSecretariaOptions = initialData.secretarias.map((secretaria) => ({
    value: secretaria.idSecretaria,
    label: buildLookupLabel(secretaria.nome, secretaria.situacao),
  }));
  const initialTipoInstituicaoOptions = initialData.tiposInstituicao.map((tipoInstituicao) => ({
    value: tipoInstituicao.id,
    label: buildLookupLabel(tipoInstituicao.descricao, tipoInstituicao.situacao),
  }));

  const [instituicoes, setInstituicoes] = useState<Instituicao[]>(initialData.instituicoes);
  const [filteredData, setFilteredData] = useState<InstituicaoRow[]>(initialRows);
  const [secretarias, setSecretarias] = useState<Secretaria[]>(initialData.secretarias);
  const [tiposInstituicao, setTiposInstituicao] = useState<TipoInstituicao[]>(
    initialData.tiposInstituicao
  );
  const [despesas, setDespesas] = useState<Despesa[]>(initialData.despesas);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(initialData.orcamentos);
  const [campos, setCampos] = useState<InstituicaoSearchField[]>(
    buildInstituicaoCampos(initialSecretariaOptions, initialTipoInstituicaoOptions)
  );
  const [error, setError] = useState<string | null>(initialError);

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
    setError(null);
  };

  useEffect(() => {
    setCampos(buildInstituicaoCampos(secretariaOptions, tipoInstituicaoOptions));
  }, [secretariaOptions, tipoInstituicaoOptions]);

  useEffect(() => {
    setFilteredData(instituicaoRows);
  }, [instituicaoRows]);

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
