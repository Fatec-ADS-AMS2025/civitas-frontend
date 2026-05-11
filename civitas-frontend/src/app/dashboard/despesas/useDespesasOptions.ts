"use client";

import { useMemo } from "react";
import type { DespesaDashboardRow } from "@/hooks/useDespesasDashboard";
import type FornecedorDTO from "@/models/fornecedor";
import type InstituicaoDTO from "@/models/instituicao";
import type OrcamentoDTO from "@/models/orcamento";
import type TipoCodigoDTO from "@/models/tipoCodigo";
import type TipoDespesaDTO from "@/models/tipoDespesa";
import type UsuarioDTO from "@/models/usuario";
import type { SelectOption } from "./despesas.types";
import { ensureOption, formatCurrency } from "./despesas.utils";

type UseDespesasOptionsInput = {
  tipoCodigos: TipoCodigoDTO[];
  tiposDespesa: TipoDespesaDTO[];
  orcamentos: OrcamentoDTO[];
  instituicoes: InstituicaoDTO[];
  fornecedores: FornecedorDTO[];
  usuarios: UsuarioDTO[];
  unidadesConsumidoras: UnidadeConsumidoraDTO[];
  activeModalDespesa: DespesaDashboardRow | null;
};

export function useDespesasOptions({
  tipoCodigos,
  tiposDespesa,
  orcamentos,
  instituicoes,
  fornecedores,
  usuarios,
  unidadesConsumidoras,
  activeModalDespesa,
}: UseDespesasOptionsInput) {
  const tipoDespesaOptions = useMemo<SelectOption[]>(
    () =>
      tiposDespesa.map((tipoDespesa) => {
        const tipoCodigo = tipoCodigos.find(
          (item) => item.id === tipoDespesa.idTipoCodigo
        );
        return {
          value: tipoDespesa.id,
          label: `${tipoCodigo?.nome ?? "Sem tipo"} - ${tipoDespesa.descricao}`,
        };
      }),
    [tipoCodigos, tiposDespesa]
  );

  const tipoCodigoOptions = useMemo<SelectOption[]>(
    () => tipoCodigos.map((item) => ({ value: item.id, label: item.nome })),
    [tipoCodigos]
  );

  const instituicaoOptions = useMemo<SelectOption[]>(
    () => instituicoes.map((item) => ({ value: item.id, label: item.nome })),
    [instituicoes]
  );

  const fornecedorOptions = useMemo<SelectOption[]>(
    () =>
      fornecedores.map((item) => ({
        value: item.idFornecedor,
        label: item.nomeFantasia || item.nome,
      })),
    [fornecedores]
  );

  const usuarioOptions = useMemo<SelectOption[]>(
    () => usuarios.map((item) => ({ value: item.id, label: item.nome })),
    [usuarios]
  );

  const unidadeConsumidoraOptions = useMemo<SelectOption[]>(
    () =>
      unidadesConsumidoras.map((unidadeConsumidora) => ({
        value: unidadeConsumidora.id,
        label: `#${String(unidadeConsumidora.id).padStart(3, "0")} - ${unidadeConsumidora.identificador}`,
      })),
    [unidadesConsumidoras]
  );

  const orcamentoOptions = useMemo<SelectOption[]>(
    () =>
      orcamentos.map((orcamento) => {
        const ano = orcamento.anoOrcamento ?? orcamento.ano;
        const valor = orcamento.valorOrcamento ?? orcamento.valor ?? 0;
        return {
          value: orcamento.idOrcamento,
          label: `#${String(orcamento.idOrcamento).padStart(3, "0")} - ${ano} - ${formatCurrency(Number(valor))}`,
        };
      }),
    [orcamentos]
  );

  const resolvedTipoDespesaOptions = useMemo(
    () =>
      ensureOption(
        tipoDespesaOptions,
        activeModalDespesa?.raw.idTipoDespesa,
        activeModalDespesa?.categoria ?? "Tipo atual"
      ),
    [activeModalDespesa, tipoDespesaOptions]
  );

  const resolvedTipoCodigoOptions = useMemo(
    () =>
      ensureOption(
        tipoCodigoOptions,
        activeModalDespesa?.tipoCodigoId ?? undefined,
        activeModalDespesa?.tipoCodigoNome ?? "Tipo atual"
      ),
    [activeModalDespesa, tipoCodigoOptions]
  );

  const resolvedInstituicaoOptions = useMemo(
    () =>
      ensureOption(
        instituicaoOptions,
        activeModalDespesa?.raw.idInstituicao,
        activeModalDespesa?.raw.idInstituicao
          ? `Instituicao #${activeModalDespesa.raw.idInstituicao}`
          : "Instituicao atual"
      ),
    [activeModalDespesa, instituicaoOptions]
  );

  const resolvedOrcamentoOptions = useMemo(
    () =>
      ensureOption(
        orcamentoOptions,
        activeModalDespesa?.raw.idOrcamento,
        activeModalDespesa?.raw.idOrcamento
          ? `Orcamento #${activeModalDespesa.raw.idOrcamento}`
          : "Orcamento atual"
      ),
    [activeModalDespesa, orcamentoOptions]
  );

  const resolvedFornecedorOptions = useMemo(
    () =>
      ensureOption(
        fornecedorOptions,
        activeModalDespesa?.raw.idFornecedor ?? activeModalDespesa?.raw.fornecedorId,
        activeModalDespesa?.raw.idFornecedor
          ? `Fornecedor #${activeModalDespesa.raw.idFornecedor}`
          : "Fornecedor atual"
      ),
    [activeModalDespesa, fornecedorOptions]
  );

  const resolvedUsuarioOptions = useMemo(
    () =>
      ensureOption(
        usuarioOptions,
        activeModalDespesa?.raw.idUsuario,
        activeModalDespesa?.raw.idUsuario
          ? `Usuario #${activeModalDespesa.raw.idUsuario}`
          : "Usuario atual"
      ),
    [activeModalDespesa, usuarioOptions]
  );

  return {
    tipoDespesaOptions,
    tipoCodigoOptions,
    resolvedTipoDespesaOptions,
    resolvedTipoCodigoOptions,
    resolvedInstituicaoOptions,
    resolvedOrcamentoOptions,
    resolvedFornecedorOptions,
    resolvedUsuarioOptions,
    resolvedUnidadeConsumidoraOptions,
  };
}
