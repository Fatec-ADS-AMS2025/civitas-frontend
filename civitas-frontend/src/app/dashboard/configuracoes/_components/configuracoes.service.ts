import { SITUACAO_ATIVO } from "@/global/situacao";
import { tipoCodigoService } from "@/hooks/tipoCodigo";
import { tipoDespesaService } from "@/hooks/tipoDespesa";
import { tipoInstituicaoService } from "@/hooks/tipoInstituicao";
import { unidadeMedidaService } from "@/hooks/unidadeMedida";
import type TipoCodigoDTO from "@/models/tipoCodigo";
import type TipoDespesaDTO from "@/models/tipoDespesa";
import type TipoInstituicaoDTO from "@/models/tipoInstituicao";
import type UnidadeMedidaDTO from "@/models/unidadeMedida";
import type {
  ConfigKind,
  ConfigRow,
  ConfiguracoesLookups,
} from "./configuracoes.types";
import {
  mapTipoCodigoRows,
  mapTipoDespesaRows,
  mapTipoInstituicaoRows,
  mapUnidadeRows,
  mergeById,
  normalizeText,
  toNumber,
} from "./configuracoes.utils";

export class ConfiguracoesService {
  async getRows(kind: ConfigKind): Promise<ConfigRow[]> {
    if (kind === "tipoCodigo") {
      return mapTipoCodigoRows(await this.fetchTipoCodigoData());
    }

    if (kind === "tipoInstituicao") {
      return mapTipoInstituicaoRows(await this.fetchTipoInstituicaoData());
    }

    if (kind === "tipoDespesa") {
      const [tiposDespesa, unidades] = await Promise.all([
        this.fetchTipoDespesaData(),
        unidadeMedidaService.getAll(),
      ]);

      return mapTipoDespesaRows(tiposDespesa, unidades);
    }

    return mapUnidadeRows(await this.fetchUnidadeData());
  }

  async getTipoDespesaLookups(): Promise<ConfiguracoesLookups> {
    const [unidadesMedida, tipoCodigos] = await Promise.all([
      this.fetchUnidadeData(),
      this.fetchTipoCodigoData(),
    ]);

    return { unidadesMedida, tipoCodigos };
  }

  async create(kind: ConfigKind, formData: Record<string, unknown>): Promise<string> {
    if (kind === "tipoCodigo") {
      const payload: Omit<TipoCodigoDTO, "id"> = {
        nome: normalizeText(formData.nome),
        descricao: normalizeText(formData.descricao),
      };
      const result = await tipoCodigoService.createEnvelope(payload);
      return result.message ?? "Tipo de codigo cadastrado com sucesso.";
    }

    if (kind === "tipoInstituicao") {
      const payload: Omit<TipoInstituicaoDTO, "id"> = {
        descricao: normalizeText(formData.descricao),
        situacao: toNumber(formData.situacao, SITUACAO_ATIVO),
      };
      const result = await tipoInstituicaoService.createEnvelope(payload);
      return result.message ?? "Tipo de instituicao cadastrado com sucesso.";
    }

    if (kind === "tipoDespesa") {
      const payload: Omit<TipoDespesaDTO, "id"> = {
        descricao: normalizeText(formData.descricao),
        solicitaUc: toNumber(formData.solicitaUc, 1),
        situacao: toNumber(formData.situacao, SITUACAO_ATIVO),
        idTipoCodigo: toNumber(formData.idTipoCodigo),
        idUnidadeMedida: toNumber(formData.idUnidadeMedida),
      };
      const result = await tipoDespesaService.createEnvelope(payload);
      return result.message ?? "Tipo de despesa cadastrado com sucesso.";
    }

    const payload: Omit<UnidadeMedidaDTO, "id"> = {
      descricao: normalizeText(formData.descricao),
      abreviatura: normalizeText(formData.abreviatura),
      situacao: toNumber(formData.situacao, SITUACAO_ATIVO),
    };
    const result = await unidadeMedidaService.createEnvelope(payload);
    return result.message ?? "Unidade de medida cadastrada com sucesso.";
  }

  async update(
    kind: ConfigKind,
    id: number,
    formData: Record<string, unknown>
  ): Promise<string> {
    if (kind === "tipoCodigo") {
      const payload: TipoCodigoDTO = {
        id,
        nome: normalizeText(formData.nome),
        descricao: normalizeText(formData.descricao),
      };
      const result = await tipoCodigoService.updateEnvelope(id, payload);
      return result.message ?? "Tipo de codigo atualizado com sucesso.";
    }

    if (kind === "tipoInstituicao") {
      const payload: TipoInstituicaoDTO = {
        id,
        descricao: normalizeText(formData.descricao),
        situacao: toNumber(formData.situacao, SITUACAO_ATIVO),
      };
      const result = await tipoInstituicaoService.updateEnvelope(id, payload);
      return result.message ?? "Tipo de instituicao atualizado com sucesso.";
    }

    if (kind === "tipoDespesa") {
      const payload: TipoDespesaDTO = {
        id,
        descricao: normalizeText(formData.descricao),
        solicitaUc: toNumber(formData.solicitaUc, 1),
        situacao: toNumber(formData.situacao, SITUACAO_ATIVO),
        idTipoCodigo: toNumber(formData.idTipoCodigo),
        idUnidadeMedida: toNumber(formData.idUnidadeMedida),
      };
      const result = await tipoDespesaService.updateEnvelope(id, payload);
      return result.message ?? "Tipo de despesa atualizado com sucesso.";
    }

    const payload: UnidadeMedidaDTO = {
      id,
      descricao: normalizeText(formData.descricao),
      abreviatura: normalizeText(formData.abreviatura),
      situacao: toNumber(formData.situacao, SITUACAO_ATIVO),
    };
    const result = await unidadeMedidaService.updateEnvelope(id, payload);
    return result.message ?? "Unidade de medida atualizada com sucesso.";
  }

  async toggleSituacao(kind: ConfigKind, id: number): Promise<string> {
    if (kind === "tipoCodigo") {
      await tipoCodigoService.delete(id);
      return "Tipo de codigo removido com sucesso.";
    }

    if (kind === "tipoInstituicao") {
      const result = await tipoInstituicaoService.alterarSituacaoEnvelope(id);
      return result.message ?? "Situacao alterada com sucesso.";
    }

    if (kind === "tipoDespesa") {
      const result = await tipoDespesaService.alterarSituacaoEnvelope(id);
      return result.message ?? "Situacao alterada com sucesso.";
    }

    const result = await unidadeMedidaService.alterarSituacaoEnvelope(id);
    return result.message ?? "Situacao alterada com sucesso.";
  }

  private async fetchTipoInstituicaoData(): Promise<TipoInstituicaoDTO[]> {
    const [ativas, inativas] = await Promise.all([
      tipoInstituicaoService.getAll(),
      tipoInstituicaoService.getInactive(),
    ]);

    return mergeById(ativas, inativas);
  }

  private async fetchTipoCodigoData(): Promise<TipoCodigoDTO[]> {
    return tipoCodigoService.getAll();
  }

  private async fetchTipoDespesaData(): Promise<TipoDespesaDTO[]> {
    const [ativas, inativas] = await Promise.all([
      tipoDespesaService.getAll(),
      tipoDespesaService.getInactive(),
    ]);

    return mergeById(ativas, inativas);
  }

  private async fetchUnidadeData(): Promise<UnidadeMedidaDTO[]> {
    const [ativas, inativas] = await Promise.all([
      unidadeMedidaService.getAll(),
      unidadeMedidaService.getInactive(),
    ]);

    return mergeById(ativas, inativas);
  }
}

export const configuracoesService = new ConfiguracoesService();
