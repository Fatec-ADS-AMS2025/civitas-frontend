import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  digitsOnly,
  normalizeDespesaPayload,
  validateDespesaDateRange,
} from '@/global/formPayload';
import { despesaService } from '@/hooks/despesa';
import { fornecedorService } from '@/hooks/fornecedor';
import { instituicaoService } from '@/hooks/instituicao';
import { orcamentoService } from '@/hooks/orcamento';
import { tipoDespesaService } from '@/hooks/tipoDespesa';
import { usuarioService } from '@/hooks/usuario';
import DespesaDTO from '@/models/despesa';
import {
  FinanceiroFiltrosDTO,
  FinanceiroPayloadDTO,
  FinanceiroResumoDTO,
  FinanceiroTransacaoDTO,
} from '@/models/financeiro';
import FornecedorDTO from '@/models/fornecedor';
import InstituicaoDTO from '@/models/instituicao';
import OrcamentoDTO from '@/models/orcamento';
import TipoDespesaDTO from '@/models/tipoDespesa';
import UsuarioDTO from '@/models/usuario';

const parseDate = (value?: string): number => {
  if (!value) return Number.NaN;
  const date = new Date(value);
  return date.getTime();
};

const normalizeOrcamentoDate = (orcamento: OrcamentoDTO): string => {
  if (orcamento.anoOrcamento) {
    return `${orcamento.anoOrcamento}-01-01`;
  }

  if (orcamento.ano) {
    return `${orcamento.ano}-01-01`;
  }

  return new Date().toISOString();
};

const mapDespesaToTransacao = (despesa: DespesaDTO): FinanceiroTransacaoDTO => ({
  id: despesa.id,
  tipo: 'despesa',
  descricao: despesa.descricao ?? despesa.numeroDocumento ?? `Despesa ${despesa.id}`,
  valor: Number(despesa.valor ?? despesa.consumoPrevisto ?? 0),
  data: despesa.data ?? despesa.dataVencimento ?? despesa.dataEmicao ?? new Date().toISOString(),
  situacao: despesa.situacao,
  instituicaoId: despesa.idInstituicao,
  referenciaId: despesa.id,
});

const mapOrcamentoToTransacao = (orcamento: OrcamentoDTO): FinanceiroTransacaoDTO => ({
  id: orcamento.id ?? orcamento.idOrcamento,
  tipo: 'orcamento',
  descricao: orcamento.descricao || `Orçamento ${orcamento.anoOrcamento ?? orcamento.ano}`,
  valor: Number(orcamento.valorOrcamento ?? orcamento.valor ?? 0),
  data: normalizeOrcamentoDate(orcamento),
  situacao: orcamento.situacao,
  instituicaoId: orcamento.idInstituicao,
  referenciaId: orcamento.idOrcamento,
});

const filterByPeriodo = (
  transacoes: FinanceiroTransacaoDTO[],
  filtros: FinanceiroFiltrosDTO
): FinanceiroTransacaoDTO[] => {
  const inicio = parseDate(filtros.dataInicio);
  const fim = parseDate(filtros.dataFim);

  if (Number.isNaN(inicio) && Number.isNaN(fim)) {
    return transacoes;
  }

  return transacoes.filter((item) => {
    const itemDate = parseDate(item.data);
    if (Number.isNaN(itemDate)) return false;

    // Budgets are annual by nature, so compare by year instead of strict month window.
    if (item.tipo === 'orcamento') {
      if (Number.isNaN(inicio) && Number.isNaN(fim)) {
        return true;
      }

      const itemYear = new Date(itemDate).getFullYear();

      if (!Number.isNaN(inicio)) {
        const startYear = new Date(inicio).getFullYear();
        if (itemYear < startYear) return false;
      }

      if (!Number.isNaN(fim)) {
        const endYear = new Date(fim).getFullYear();
        if (itemYear > endYear) return false;
      }

      return true;
    }

    if (!Number.isNaN(inicio) && itemDate < inicio) return false;
    if (!Number.isNaN(fim) && itemDate > fim) return false;

    return true;
  });
};

const filterByStatus = (
  transacoes: FinanceiroTransacaoDTO[],
  status?: number
): FinanceiroTransacaoDTO[] => {
  if (status === undefined || status === null) {
    return transacoes;
  }

  return transacoes.filter((item) => item.situacao === status);
};

const filterByInstituicao = (
  transacoes: FinanceiroTransacaoDTO[],
  instituicaoId?: number
): FinanceiroTransacaoDTO[] => {
  if (!instituicaoId) {
    return transacoes;
  }

  return transacoes.filter((item) => item.instituicaoId === instituicaoId);
};

const isHttpNotFound = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes('HTTP 404');
};

const toArray = <T>(value: T[] | null | undefined): T[] => {
  return Array.isArray(value) ? value : [];
};

const safeListRequest = async <T>(request: () => Promise<T[] | null | undefined>): Promise<T[]> => {
  try {
    const response = await request();
    return toArray(response);
  } catch (error) {
    if (!isHttpNotFound(error)) {
      console.error('Erro ao carregar lista financeira:', error);
    }

    return [];
  }
};

const buildNumeroDocumento = (payload: FinanceiroPayloadDTO): string => {
  const providedDigits = digitsOnly(payload.numeroDocumento);
  if (providedDigits) {
    return providedDigits;
  }

  const descriptionDigits = digitsOnly(payload.descricao);
  if (descriptionDigits) {
    return descriptionDigits;
  }

  return String(Date.now());
};

export class FinanceiroService {
  async getInstituicoes(): Promise<InstituicaoDTO[]> {
    return safeListRequest(() => instituicaoService.getAllData());
  }

  async getTiposDespesa(): Promise<TipoDespesaDTO[]> {
    return safeListRequest(() => tipoDespesaService.getAllData());
  }

  async getOrcamentos(): Promise<OrcamentoDTO[]> {
    return safeListRequest(() => orcamentoService.getAllData());
  }

  async getFornecedores(): Promise<FornecedorDTO[]> {
    return safeListRequest(() => fornecedorService.getAllData());
  }

  async getUsuarios(): Promise<UsuarioDTO[]> {
    return safeListRequest(() => usuarioService.getAllData());
  }

  async listarTransacoes(filtros: FinanceiroFiltrosDTO = {}): Promise<FinanceiroTransacaoDTO[]> {
    const [despesas, orcamentos] = await Promise.all([
      safeListRequest(() =>
        despesaService.getByFilters({ page: filtros.pageNumber, size: filtros.pageSize })
      ),
      safeListRequest(() =>
        orcamentoService.getByFilters({ page: filtros.pageNumber, size: filtros.pageSize })
      ),
    ]);

    const transacoes = [
      ...despesas.map(mapDespesaToTransacao),
      ...orcamentos.map(mapOrcamentoToTransacao),
    ];

    const byPeriodo = filterByPeriodo(transacoes, filtros);
    const byStatus = filterByStatus(byPeriodo, filtros.status);
    const byInstituicao = filterByInstituicao(byStatus, filtros.instituicaoId);

    return byInstituicao.sort((a, b) => parseDate(b.data) - parseDate(a.data));
  }

  async getResumo(filtros: FinanceiroFiltrosDTO = {}): Promise<FinanceiroResumoDTO> {
    const transacoes = await this.listarTransacoes(filtros);

    const totalDespesas = transacoes
      .filter((item) => item.tipo === 'despesa')
      .reduce((acc, item) => acc + item.valor, 0);

    const totalOrcamentos = transacoes
      .filter((item) => item.tipo === 'orcamento')
      .reduce((acc, item) => acc + item.valor, 0);

    const saldo = totalOrcamentos - totalDespesas;

    return {
      totalDespesas,
      totalOrcamentos,
      saldo,
      balanca: saldo,
      totalTransacoes: transacoes.length,
      periodoInicio: filtros.dataInicio,
      periodoFim: filtros.dataFim,
    };
  }

  async cadastrar(payload: FinanceiroPayloadDTO): Promise<DespesaDTO | OrcamentoDTO> {
    if (payload.tipo === 'orcamento') {
      if (!payload.anoOrcamento || payload.anoOrcamento <= 0) {
        throw new Error('Ano do orçamento inválido.');
      }

      if (!(payload.valorOrcamento ?? payload.valor) || (payload.valorOrcamento ?? payload.valor)! <= 0) {
        throw new Error('Valor do orçamento inválido.');
      }

      if (!payload.idInstituicao || !payload.idTipoDespesa) {
        throw new Error('Instituição e tipo de despesa são obrigatórios para orçamento.');
      }

      const body = {
        anoOrcamento: payload.anoOrcamento,
        valorOrcamento: payload.valorOrcamento ?? payload.valor,
        idInstituicao: payload.idInstituicao,
        idTipoDespesa: payload.idTipoDespesa,
        situacao: payload.situacao,
      };

      return orcamentoService.createData(body);
    }

    if (!payload.idOrcamento || !payload.idTipoDespesa || !payload.idInstituicao) {
      throw new Error('Despesa exige idOrcamento, idTipoDespesa e idInstituicao válidos.');
    }

    if (!payload.dataVencimento && !payload.data) {
      throw new Error('Despesa exige data de vencimento.');
    }

    if (!payload.uc || !payload.uc.trim()) {
      throw new Error('Despesa exige UC preenchida.');
    }

    const body = normalizeDespesaPayload({
      id: 0,
      numeroDocumento: buildNumeroDocumento(payload),
      uc: payload.uc?.trim(),
      dataEmicao: payload.dataEmicao ?? payload.data,
      consumoPrevisto: payload.consumoPrevisto ?? payload.valor,
      dataVencimento: payload.dataVencimento ?? payload.data,
      situacao: payload.situacao,
      idTipoDespesa: payload.idTipoDespesa,
      idOrcamento: payload.idOrcamento,
      idInstituicao: payload.idInstituicao,
      idFornecedor: payload.idFornecedor ?? payload.fornecedorId,
      idUsuario: payload.idUsuario,
    }) as DespesaDTO;

    if (!body.numeroDocumento) {
      throw new Error('Despesa exige numero de documento numerico.');
    }

    const dateRangeError = validateDespesaDateRange(body.dataEmicao, body.dataVencimento);
    if (dateRangeError) {
      throw new Error(dateRangeError);
    }

    return despesaService.createData(body);
  }

  async atualizar(id: number, payload: FinanceiroPayloadDTO): Promise<DespesaDTO | OrcamentoDTO> {
    if (payload.tipo === 'orcamento') {
      if (!payload.anoOrcamento || payload.anoOrcamento <= 0) {
        throw new Error('Ano do orçamento inválido.');
      }

      if (!(payload.valorOrcamento ?? payload.valor) || (payload.valorOrcamento ?? payload.valor)! <= 0) {
        throw new Error('Valor do orçamento inválido.');
      }

      if (!payload.idInstituicao || !payload.idTipoDespesa) {
        throw new Error('Instituição e tipo de despesa são obrigatórios para orçamento.');
      }

      const body = {
        idOrcamento: id,
        anoOrcamento: payload.anoOrcamento,
        valorOrcamento: payload.valorOrcamento ?? payload.valor,
        idInstituicao: payload.idInstituicao,
        idTipoDespesa: payload.idTipoDespesa,
        situacao: payload.situacao,
      };

      return orcamentoService.updateData(id, body);
    }

    // Merge with current record to avoid breaking required fields when updating only part of a despesa.
    const current = await despesaService.getByIdData(id);
    if (!current) {
      throw new Error(`Despesa ${id} nao encontrada.`);
    }

    const numeroDocumento =
      buildNumeroDocumento({
        ...payload,
        numeroDocumento: payload.numeroDocumento ?? current.numeroDocumento,
        descricao: payload.descricao ?? current.descricao,
      }) || String(Date.now());
    const uc = payload.uc?.trim() || current.uc || '';
    const dataVencimento = payload.dataVencimento ?? payload.data ?? current.dataVencimento ?? current.data;
    const dataEmicao = payload.dataEmicao ?? payload.data ?? current.dataEmicao ?? current.data ?? dataVencimento;
    const consumoPrevisto = payload.consumoPrevisto ?? payload.valor ?? current.consumoPrevisto ?? current.valor;
    const idTipoDespesa = payload.idTipoDespesa ?? current.idTipoDespesa;
    const idOrcamento = payload.idOrcamento ?? current.idOrcamento;
    const idInstituicao = payload.idInstituicao ?? current.idInstituicao;
    const idFornecedor = payload.idFornecedor ?? payload.fornecedorId ?? current.idFornecedor;
    const idUsuario = payload.idUsuario ?? current.idUsuario;

    if (!idOrcamento || !idTipoDespesa || !idInstituicao) {
      throw new Error('Despesa exige idOrcamento, idTipoDespesa e idInstituicao válidos.');
    }

    if (!dataVencimento) {
      throw new Error('Despesa exige data de vencimento.');
    }

    if (!uc.trim()) {
      throw new Error('Despesa exige UC preenchida.');
    }

    const body = normalizeDespesaPayload({
      id,
      numeroDocumento,
      uc,
      dataEmicao,
      consumoPrevisto,
      dataVencimento,
      situacao: payload.situacao ?? current.situacao,
      idTipoDespesa,
      idOrcamento,
      idInstituicao,
      idFornecedor,
      idUsuario,
    }) as DespesaDTO;

    if (!body.numeroDocumento) {
      throw new Error('Despesa exige numero de documento numerico.');
    }

    const dateRangeError = validateDespesaDateRange(body.dataEmicao, body.dataVencimento);
    if (dateRangeError) {
      throw new Error(dateRangeError);
    }

    return despesaService.updateData(id, body);
  }

  async excluir(id: number, tipo: 'despesa' | 'orcamento'): Promise<void> {
    if (tipo === 'orcamento') {
      await orcamentoService.delete(id);
      return;
    }

    await despesaService.alterarSituacao(id);
  }
}

export const financeiroService = new FinanceiroService();

export const useFinanceiro = (initialFilters: FinanceiroFiltrosDTO = {}) => {
  const [filtros, setFiltros] = useState<FinanceiroFiltrosDTO>(initialFilters);
  const [transacoes, setTransacoes] = useState<FinanceiroTransacaoDTO[]>([]);
  const [resumo, setResumo] = useState<FinanceiroResumoDTO | null>(null);
  const [instituicoes, setInstituicoes] = useState<InstituicaoDTO[]>([]);
  const [tiposDespesa, setTiposDespesa] = useState<TipoDespesaDTO[]>([]);
  const [orcamentos, setOrcamentos] = useState<OrcamentoDTO[]>([]);
  const [fornecedores, setFornecedores] = useState<FornecedorDTO[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadFinanceiro = useCallback(async (activeFilters: FinanceiroFiltrosDTO) => {
    try {
      setLoading(true);
      const [
        lista,
        cards,
        instituicoesData,
        tiposDespesaData,
        orcamentosData,
        fornecedoresData,
        usuariosData,
      ] = await Promise.all([
        financeiroService.listarTransacoes(activeFilters),
        financeiroService.getResumo(activeFilters),
        financeiroService.getInstituicoes(),
        financeiroService.getTiposDespesa(),
        financeiroService.getOrcamentos(),
        financeiroService.getFornecedores(),
        financeiroService.getUsuarios(),
      ]);

      setTransacoes(lista);
      setResumo(cards);
      setInstituicoes(instituicoesData);
      setTiposDespesa(tiposDespesaData);
      setOrcamentos(orcamentosData);
      setFornecedores(fornecedoresData);
      setUsuarios(usuariosData);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados financeiros.';
      setError(message);
      setTransacoes([]);
      setResumo(null);
      setInstituicoes([]);
      setTiposDespesa([]);
      setOrcamentos([]);
      setFornecedores([]);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFinanceiro(filtros);
  }, [filtros, loadFinanceiro]);

  const aplicarFiltros = useCallback((nextFilters: Partial<FinanceiroFiltrosDTO>) => {
    setFiltros((prev) => ({ ...prev, ...nextFilters }));
  }, []);

  const refetch = useCallback(async () => {
    await loadFinanceiro(filtros);
  }, [filtros, loadFinanceiro]);

  const cadastrar = useCallback(
    async (payload: FinanceiroPayloadDTO) => {
      await financeiroService.cadastrar(payload);
      await loadFinanceiro(filtros);
    },
    [filtros, loadFinanceiro]
  );

  const atualizar = useCallback(
    async (id: number, payload: FinanceiroPayloadDTO) => {
      await financeiroService.atualizar(id, payload);
      await loadFinanceiro(filtros);
    },
    [filtros, loadFinanceiro]
  );

  const excluir = useCallback(
    async (id: number, tipo: 'despesa' | 'orcamento') => {
      await financeiroService.excluir(id, tipo);
      await loadFinanceiro(filtros);
    },
    [filtros, loadFinanceiro]
  );

  return useMemo(
    () => ({
      filtros,
      transacoes,
      resumo,
      instituicoes,
      tiposDespesa,
      orcamentos,
      fornecedores,
      usuarios,
      loading,
      error,
      hasData: transacoes.length > 0,
      aplicarFiltros,
      refetch,
      cadastrar,
      atualizar,
      excluir,
    }),
    [
      filtros,
      transacoes,
      resumo,
      instituicoes,
      tiposDespesa,
      orcamentos,
      fornecedores,
      usuarios,
      loading,
      error,
      aplicarFiltros,
      refetch,
      cadastrar,
      atualizar,
      excluir,
    ]
  );
};
