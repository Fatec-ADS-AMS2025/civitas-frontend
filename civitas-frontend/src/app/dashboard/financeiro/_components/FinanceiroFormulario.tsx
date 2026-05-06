'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { FinanceiroPayloadDTO, FinanceiroTransacaoDTO } from '@/models/financeiro';
import FornecedorDTO from '@/models/fornecedor';
import InstituicaoDTO from '@/models/instituicao';
import OrcamentoDTO from '@/models/orcamento';
import TipoDespesaDTO from '@/models/tipoDespesa';
import UsuarioDTO from '@/models/usuario';
import { showToast } from '@/hooks/useToast';

type FormState = {
  descricao: string;
  uc: string;
  valor: string;
  data: string;
  anoOrcamento: string;
  situacao: string;
  idInstituicao: string;
  idTipoDespesa: string;
  idOrcamento: string;
  idFornecedor: string;
  idUsuario: string;
};

const emptyFormState: FormState = {
  descricao: '',
  uc: '',
  valor: '',
  data: '',
  anoOrcamento: String(new Date().getFullYear()),
  situacao: '1',
  idInstituicao: '',
  idTipoDespesa: '',
  idOrcamento: '',
  idFornecedor: '',
  idUsuario: '',
};

const toPositiveNumber = (value: string): number => Number(value || 0);
const toOptionalPositiveNumber = (value: string): number | undefined => {
  if (!value) return undefined;
  const numericValue = Number(value);
  return numericValue > 0 ? numericValue : undefined;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

type FinanceiroFormularioProps = {
  transacoes: FinanceiroTransacaoDTO[];
  instituicoes: InstituicaoDTO[];
  tiposDespesa: TipoDespesaDTO[];
  orcamentos: OrcamentoDTO[];
  fornecedores: FornecedorDTO[];
  usuarios: UsuarioDTO[];
  onCreate: (payload: FinanceiroPayloadDTO) => Promise<void>;
  onUpdate: (id: number, payload: FinanceiroPayloadDTO) => Promise<void>;
  loading?: boolean;
};

export default function FinanceiroFormulario({
  transacoes,
  instituicoes,
  tiposDespesa,
  orcamentos,
  fornecedores,
  usuarios,
  onCreate,
  onUpdate,
  loading = false,
}: FinanceiroFormularioProps) {
  // Cadastrar state
  const [createTipo, setCreateTipo] = useState<'despesa' | 'orcamento'>('despesa');
  const [createForm, setCreateForm] = useState<FormState>(emptyFormState);
  const [createProcessing, setCreateProcessing] = useState(false);

  // Atualizar state
  const [updateTipo, setUpdateTipo] = useState<'despesa' | 'orcamento'>('despesa');
  const [updateForm, setUpdateForm] = useState<FormState>(emptyFormState);
  const [idEditar, setIdEditar] = useState('');
  const [updateProcessing, setUpdateProcessing] = useState(false);

  const transacoesParaAtualizar = useMemo(
    () => transacoes.filter((item) => item.tipo === updateTipo),
    [transacoes, updateTipo]
  );

  const transacaoSelecionada = useMemo(() => {
    if (!idEditar) return null;
    return transacoes.find((t) => String(t.id) === idEditar && t.tipo === updateTipo) ?? null;
  }, [transacoes, idEditar, updateTipo]);

  const buildPayload = useCallback((tipo: 'despesa' | 'orcamento', form: FormState, mode: 'create' | 'update'): FinanceiroPayloadDTO => {
    const valor = mode === 'create' ? toPositiveNumber(form.valor) : toOptionalPositiveNumber(form.valor);

    if (tipo === 'despesa') {
      return {
        tipo: 'despesa',
        descricao: form.descricao || undefined,
        numeroDocumento: form.descricao || undefined,
        uc: form.uc.trim() || undefined,
        valor,
        data: form.data || undefined,
        dataVencimento: form.data || undefined,
        consumoPrevisto: valor,
        situacao: mode === 'create' ? toPositiveNumber(form.situacao) : toOptionalPositiveNumber(form.situacao),
        idInstituicao: mode === 'create' ? toPositiveNumber(form.idInstituicao) : toOptionalPositiveNumber(form.idInstituicao),
        idTipoDespesa: mode === 'create' ? toPositiveNumber(form.idTipoDespesa) : toOptionalPositiveNumber(form.idTipoDespesa),
        idOrcamento: mode === 'create' ? toPositiveNumber(form.idOrcamento) : toOptionalPositiveNumber(form.idOrcamento),
        idFornecedor: toOptionalPositiveNumber(form.idFornecedor),
        idUsuario: toOptionalPositiveNumber(form.idUsuario),
      };
    }

    return {
      tipo: 'orcamento',
      descricao: form.descricao || undefined,
      valor,
      valorOrcamento: valor,
      anoOrcamento: mode === 'create' ? toPositiveNumber(form.anoOrcamento) : toOptionalPositiveNumber(form.anoOrcamento),
      situacao: mode === 'create' ? toPositiveNumber(form.situacao) : toOptionalPositiveNumber(form.situacao),
      idInstituicao: mode === 'create' ? toPositiveNumber(form.idInstituicao) : toOptionalPositiveNumber(form.idInstituicao),
      idTipoDespesa: mode === 'create' ? toPositiveNumber(form.idTipoDespesa) : toOptionalPositiveNumber(form.idTipoDespesa),
    };
  }, []);

  const handleCreate = async () => {
    const valor = toPositiveNumber(createForm.valor);
    const idInstituicao = toPositiveNumber(createForm.idInstituicao);
    const idTipoDespesa = toPositiveNumber(createForm.idTipoDespesa);

    if (valor <= 0) { showToast('Valor deve ser maior que 0.', 'error'); return; }
    if (idInstituicao <= 0) { showToast('Selecione uma instituição.', 'error'); return; }
    if (idTipoDespesa <= 0) { showToast('Selecione um tipo de despesa.', 'error'); return; }

    if (createTipo === 'despesa') {
      if (!createForm.uc.trim()) { showToast('UC é obrigatória.', 'error'); return; }
      if (!createForm.data) { showToast('Data é obrigatória.', 'error'); return; }
      if (toPositiveNumber(createForm.idOrcamento) <= 0) { showToast('Selecione um orçamento.', 'error'); return; }
    } else {
      if (toPositiveNumber(createForm.anoOrcamento) <= 0) { showToast('Ano inválido.', 'error'); return; }
    }

    setCreateProcessing(true);
    try {
      const payload = buildPayload(createTipo, createForm, 'create');
      await onCreate(payload);
      showToast(`${createTipo === 'despesa' ? 'Despesa' : 'Orçamento'} cadastrado com sucesso!`, 'success');
      setCreateForm(emptyFormState);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao cadastrar.';
      showToast(message, 'error');
    } finally {
      setCreateProcessing(false);
    }
  };

  const handleUpdate = async () => {
    if (!idEditar) { showToast('Selecione um registro para atualizar.', 'error'); return; }

    setUpdateProcessing(true);
    try {
      const payload = buildPayload(updateTipo, updateForm, 'update');
      await onUpdate(Number(idEditar), payload);
      showToast(`${updateTipo === 'despesa' ? 'Despesa' : 'Orçamento'} atualizado com sucesso!`, 'success');
      setUpdateForm(emptyFormState);
      setIdEditar('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar.';
      showToast(message, 'error');
    } finally {
      setUpdateProcessing(false);
    }
  };

  const inputClass = `
    w-full rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 py-2
    text-[12px] text-[var(--foreground)] placeholder:text-[var(--foreground-soft)]
    shadow-[var(--shadow-xs)] focus:border-[var(--secundary-1)] focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]
    disabled:cursor-not-allowed disabled:opacity-60
  `;

  const tabClass = (active: boolean) => `
    flex-1 rounded-sm border px-3 py-1.5 text-[11px] font-semibold transition-all duration-[var(--motion-duration-fast)]
    ${active
      ? 'border-transparent bg-[var(--surface-brand)] text-[var(--text-on-brand)] shadow-[var(--shadow-xs)]'
      : 'border-[var(--border-soft)] bg-[var(--surface-subtle)] text-[var(--foreground-muted)] hover:bg-[var(--surface-elevated)]'
    }
  `;

  const disabled = loading || createProcessing || updateProcessing;

  return (
    <div className="civitas-surface civitas-enter rounded-sm p-5">
      {/* Header */}
      <div className="civitas-panel-header mb-4">
        <span className="civitas-chip civitas-chip--amber w-fit px-3 py-1 text-[10px] tracking-[0.12em]">
          Operação
        </span>
        <h3 className="mt-1 text-[18px] font-bold text-[var(--foreground)]">
          Cadastro e atualização
        </h3>
        <p className="mt-1 text-[12px] leading-relaxed text-[var(--foreground-soft)]">
          Cadastre novos lançamentos e atualize registros existentes com mais praticidade.
        </p>
      </div>

      {/* Two columns layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left column - Cadastrar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-soft)]">Novo Registro</p>
              <p className="text-[14px] font-bold text-[var(--foreground)]">Cadastrar</p>
            </div>
          </div>

          {/* Tipo tabs */}
          <div className="flex gap-1.5">
            <button
              onClick={() => { setCreateTipo('despesa'); setCreateForm(emptyFormState); }}
              disabled={disabled}
              className={tabClass(createTipo === 'despesa')}
            >
              Despesa
            </button>
            <button
              onClick={() => { setCreateTipo('orcamento'); setCreateForm(emptyFormState); }}
              disabled={disabled}
              className={tabClass(createTipo === 'orcamento')}
            >
              Orçamento
            </button>
          </div>

          {/* Form fields */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-0.5 block text-[10px] font-medium text-[var(--foreground-muted)]">Descrição</label>
                <input
                  type="text"
                  value={createForm.descricao}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Conta de energia..."
                  disabled={disabled}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] font-medium text-[var(--foreground-muted)]">Valor</label>
                <input
                  type="number"
                  value={createForm.valor}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, valor: e.target.value }))}
                  placeholder="0.00"
                  disabled={disabled}
                  className={inputClass}
                />
              </div>
            </div>

            {createTipo === 'despesa' ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-0.5 block text-[10px] font-medium text-[var(--foreground-muted)]">UC</label>
                    <input
                      type="text"
                      value={createForm.uc}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, uc: e.target.value }))}
                      placeholder="Unidade"
                      disabled={disabled}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] font-medium text-[var(--foreground-muted)]">Data</label>
                    <input
                      type="date"
                      value={createForm.data}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, data: e.target.value }))}
                      disabled={disabled}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] font-medium text-[var(--foreground-muted)]">Orçamento</label>
                  <select
                    value={createForm.idOrcamento}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, idOrcamento: e.target.value }))}
                    disabled={disabled}
                    className={inputClass}
                  >
                    <option value="">Selecione...</option>
                    {orcamentos.map((item) => (
                      <option key={item.idOrcamento} value={String(item.idOrcamento)}>
                        {item.idOrcamento} - Ano {item.anoOrcamento ?? item.ano}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div>
                <label className="mb-0.5 block text-[10px] font-medium text-[var(--foreground-muted)]">Ano</label>
                <input
                  type="number"
                  value={createForm.anoOrcamento}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, anoOrcamento: e.target.value }))}
                  placeholder={String(new Date().getFullYear())}
                  disabled={disabled}
                  className={inputClass}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-0.5 block text-[10px] font-medium text-[var(--foreground-muted)]">Instituição</label>
                <select
                  value={createForm.idInstituicao}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, idInstituicao: e.target.value }))}
                  disabled={disabled}
                  className={inputClass}
                >
                  <option value="">Selecione...</option>
                  {instituicoes.map((item) => (
                    <option key={item.id} value={String(item.id)}>{item.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] font-medium text-[var(--foreground-muted)]">Tipo Despesa</label>
                <select
                  value={createForm.idTipoDespesa}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, idTipoDespesa: e.target.value }))}
                  disabled={disabled}
                  className={inputClass}
                >
                  <option value="">Selecione...</option>
                  {tiposDespesa.map((item) => (
                    <option key={item.id} value={String(item.id)}>{item.descricao}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={() => void handleCreate()}
            disabled={disabled}
            className="civitas-action civitas-action--secondary w-full justify-center rounded-sm px-4 py-2.5 text-[12px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createProcessing ? 'Salvando...' : 'Salvar registro'}
          </button>
        </div>

        {/* Right column - Atualizar */}
        <div className="space-y-3 border-t border-[var(--divider)] pt-4 lg:border-l lg:border-t-0 lg:border-l-[var(--divider)] lg:pl-4 lg:pt-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-soft)]">Manutenção</p>
              <p className="text-[14px] font-bold text-[var(--foreground)]">Atualizar</p>
            </div>
            <button className="flex h-6 w-6 items-center justify-center rounded-sm border border-[var(--border-soft)] text-[var(--foreground-soft)]">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Tipo tabs */}
          <div className="flex gap-1.5">
            <button
              onClick={() => { setUpdateTipo('despesa'); setUpdateForm(emptyFormState); setIdEditar(''); }}
              disabled={disabled}
              className={tabClass(updateTipo === 'despesa')}
            >
              Despesa
            </button>
            <button
              onClick={() => { setUpdateTipo('orcamento'); setUpdateForm(emptyFormState); setIdEditar(''); }}
              disabled={disabled}
              className={tabClass(updateTipo === 'orcamento')}
            >
              Orçamento
            </button>
          </div>

          {/* Select registro */}
          <div>
            <label className="mb-0.5 block text-[10px] font-medium text-[var(--foreground-muted)]">Registro para editar</label>
            <select
              value={idEditar}
              onChange={(e) => setIdEditar(e.target.value)}
              disabled={disabled}
              className={inputClass}
            >
              <option value="">Selecione um registro</option>
              {transacoesParaAtualizar.map((item) => (
                <option key={`${item.tipo}-${item.id}`} value={String(item.id)}>
                  #{item.id} - {item.descricao}
                </option>
              ))}
            </select>
          </div>

          {/* Contexto atual */}
          {transacaoSelecionada && (
            <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-3 shadow-[var(--shadow-xs)]">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-soft)]">
                Contexto atual
              </p>
              <p className="mt-1 text-[13px] font-semibold text-[var(--secundary-1)]">
                #{transacaoSelecionada.id} - {transacaoSelecionada.descricao}
              </p>
              <p className="text-[11px] text-[var(--foreground-muted)]">
                {transacaoSelecionada.tipo === 'despesa' ? 'Despesa' : 'Orçamento'}{' '}
                {formatCurrency(transacaoSelecionada.valor)}
              </p>
            </div>
          )}

          {/* Update form fields (simplified) */}
          {idEditar && (
            <div className="space-y-2">
              <div>
                <label className="mb-0.5 block text-[10px] font-medium text-[var(--foreground-muted)]">Nova descrição</label>
                <input
                  type="text"
                  value={updateForm.descricao}
                  onChange={(e) => setUpdateForm((prev) => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Deixe vazio para manter"
                  disabled={disabled}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] font-medium text-[var(--foreground-muted)]">Novo valor</label>
                <input
                  type="number"
                  value={updateForm.valor}
                  onChange={(e) => setUpdateForm((prev) => ({ ...prev, valor: e.target.value }))}
                  placeholder="Deixe vazio para manter"
                  disabled={disabled}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <button
            onClick={() => void handleUpdate()}
            disabled={disabled || !idEditar}
            className="civitas-action civitas-action--secondary w-full justify-center rounded-sm px-4 py-2.5 text-[12px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateProcessing ? 'Atualizando...' : 'Atualizar registro'}
          </button>
        </div>
      </div>
    </div>
  );
}
