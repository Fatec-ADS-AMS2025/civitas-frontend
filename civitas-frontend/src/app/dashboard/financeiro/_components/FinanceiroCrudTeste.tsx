import React, { useMemo, useState } from 'react';
import { FinanceiroPayloadDTO, FinanceiroTransacaoDTO } from '@/models/financeiro';
import FornecedorDTO from '@/models/fornecedor';
import InstituicaoDTO from '@/models/instituicao';
import OrcamentoDTO from '@/models/orcamento';
import TipoDespesaDTO from '@/models/tipoDespesa';
import UsuarioDTO from '@/models/usuario';

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

const controlClassName =
  'h-[46px] rounded-sm border border-[#D5E3E6] bg-white px-4 text-sm text-[#1F2A32] outline-none transition focus:border-[#58AFAE] focus:ring-4 focus:ring-[#58AFAE]/20';

type FinanceiroCrudTesteProps = {
  transacoes: FinanceiroTransacaoDTO[];
  instituicoes: InstituicaoDTO[];
  tiposDespesa: TipoDespesaDTO[];
  orcamentos: OrcamentoDTO[];
  fornecedores: FornecedorDTO[];
  usuarios: UsuarioDTO[];
  onCreate: (payload: FinanceiroPayloadDTO) => Promise<void>;
  onUpdate: (id: number, payload: FinanceiroPayloadDTO) => Promise<void>;
};

export default function FinanceiroCrudTeste({
  transacoes,
  instituicoes,
  tiposDespesa,
  orcamentos,
  fornecedores,
  usuarios,
  onCreate,
  onUpdate,
}: FinanceiroCrudTesteProps) {
  const [createTipo, setCreateTipo] = useState<'despesa' | 'orcamento'>('despesa');
  const [updateTipo, setUpdateTipo] = useState<'despesa' | 'orcamento'>('despesa');
  const [createForm, setCreateForm] = useState<FormState>(emptyFormState);
  const [updateForm, setUpdateForm] = useState<FormState>(emptyFormState);
  const [idEditar, setIdEditar] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const transacoesAtualizacao = useMemo(
    () => transacoes.filter((item) => item.tipo === updateTipo),
    [transacoes, updateTipo]
  );

  const validateForm = (tipo: 'despesa' | 'orcamento', form: FormState): string | null => {
    const valor = toPositiveNumber(form.valor);
    const idInstituicao = toPositiveNumber(form.idInstituicao);
    const idTipoDespesa = toPositiveNumber(form.idTipoDespesa);

    if (valor <= 0) return 'Valor deve ser maior que 0.';
    if (idInstituicao <= 0) return 'Selecione uma instituicao valida.';
    if (idTipoDespesa <= 0) return 'Selecione um tipo de despesa valido.';

    if (tipo === 'despesa') {
      const idOrcamento = toPositiveNumber(form.idOrcamento);
      if (!form.uc.trim()) return 'UC e obrigatoria para despesa.';
      if (!form.data) return 'Data e obrigatoria para despesa.';
      if (idOrcamento <= 0) return 'Selecione um orcamento valido para despesa.';
      return null;
    }

    const anoOrcamento = toPositiveNumber(form.anoOrcamento);
    if (anoOrcamento <= 0) return 'Ano do orcamento deve ser maior que 0.';
    return null;
  };

  const buildPayload = (
    tipo: 'despesa' | 'orcamento',
    form: FormState,
    mode: 'create' | 'update'
  ): FinanceiroPayloadDTO => {
    const valor = mode === 'create' ? toPositiveNumber(form.valor) : toOptionalPositiveNumber(form.valor);

    if (tipo === 'despesa') {
      return {
        tipo,
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
      tipo,
      descricao: form.descricao || undefined,
      valor,
      valorOrcamento: valor,
      anoOrcamento: mode === 'create' ? toPositiveNumber(form.anoOrcamento) : toOptionalPositiveNumber(form.anoOrcamento),
      situacao: mode === 'create' ? toPositiveNumber(form.situacao) : toOptionalPositiveNumber(form.situacao),
      idInstituicao: mode === 'create' ? toPositiveNumber(form.idInstituicao) : toOptionalPositiveNumber(form.idInstituicao),
      idTipoDespesa: mode === 'create' ? toPositiveNumber(form.idTipoDespesa) : toOptionalPositiveNumber(form.idTipoDespesa),
    };
  };

  const handleCreate = async () => {
    setCreateError(null);
    const validationError = validateForm(createTipo, createForm);
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    try {
      const payload = buildPayload(createTipo, createForm, 'create');
      await onCreate(payload);
      setCreateForm(emptyFormState);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao cadastrar.';
      setCreateError(message);
    }
  };

  const handleUpdate = async () => {
    setUpdateError(null);

    if (!idEditar) {
      setUpdateError('Selecione um registro para atualizar.');
      return;
    }

    try {
      const payload = buildPayload(updateTipo, updateForm, 'update');
      await onUpdate(Number(idEditar), payload);
      setIdEditar('');
      setUpdateForm(emptyFormState);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar.';
      setUpdateError(message);
    }
  };

  const renderFormFields = (
    tipo: 'despesa' | 'orcamento',
    form: FormState,
    setForm: React.Dispatch<React.SetStateAction<FormState>>
  ) => (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-10">
      <input
        value={form.descricao}
        onChange={(event) => setForm((prev) => ({ ...prev, descricao: event.target.value }))}
        placeholder="Descricao"
        aria-label="Descricao"
        className={controlClassName}
      />

      {tipo === 'despesa' ? (
        <>
          <input
            value={form.uc}
            onChange={(event) => setForm((prev) => ({ ...prev, uc: event.target.value }))}
            placeholder="UC (obrigatoria)"
            aria-label="UC"
            className={controlClassName}
          />
          <input
            value={form.data}
            onChange={(event) => setForm((prev) => ({ ...prev, data: event.target.value }))}
            type="date"
            aria-label="Data"
            className={controlClassName}
          />
          <select
            value={form.idOrcamento}
            onChange={(event) => setForm((prev) => ({ ...prev, idOrcamento: event.target.value }))}
            aria-label="Orcamento"
            className={controlClassName}
          >
            <option value="">Orcamento (obrigatorio)</option>
            {orcamentos.map((item) => (
              <option key={item.idOrcamento} value={String(item.idOrcamento)}>
                {`${item.idOrcamento} - Ano ${item.anoOrcamento ?? item.ano}`}
              </option>
            ))}
          </select>

          <select
            value={form.idFornecedor}
            onChange={(event) => setForm((prev) => ({ ...prev, idFornecedor: event.target.value }))}
            aria-label="Fornecedor"
            className={controlClassName}
          >
            <option value="">Fornecedor (opcional)</option>
            {fornecedores.map((item) => (
              <option key={item.idFornecedor} value={String(item.idFornecedor)}>
                {`${item.idFornecedor} - ${item.nomeFantasia}`}
              </option>
            ))}
          </select>

          <select
            value={form.idUsuario}
            onChange={(event) => setForm((prev) => ({ ...prev, idUsuario: event.target.value }))}
            aria-label="Usuario"
            className={controlClassName}
          >
            <option value="">Usuario (opcional)</option>
            {usuarios.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {`${item.id} - ${item.nome}`}
              </option>
            ))}
          </select>
        </>
      ) : (
        <input
          value={form.anoOrcamento}
          onChange={(event) => setForm((prev) => ({ ...prev, anoOrcamento: event.target.value }))}
          type="number"
          placeholder="Ano do orcamento"
          aria-label="Ano do orcamento"
          className={controlClassName}
        />
      )}

      <input
        value={form.valor}
        onChange={(event) => setForm((prev) => ({ ...prev, valor: event.target.value }))}
        type="number"
        placeholder="Valor"
        aria-label="Valor"
        className={controlClassName}
      />

      <select
        value={form.situacao}
        onChange={(event) => setForm((prev) => ({ ...prev, situacao: event.target.value }))}
        aria-label="Situacao"
        className={controlClassName}
      >
        <option value="1">Ativo</option>
        <option value="2">Inativo</option>
      </select>

      <select
        value={form.idInstituicao}
        onChange={(event) => setForm((prev) => ({ ...prev, idInstituicao: event.target.value }))}
        aria-label="Instituicao"
        className={controlClassName}
      >
        <option value="">Instituicao</option>
        {instituicoes.map((item) => (
          <option key={item.id} value={String(item.id)}>
            {`${item.id} - ${item.nome}`}
          </option>
        ))}
      </select>

      <select
        value={form.idTipoDespesa}
        onChange={(event) => setForm((prev) => ({ ...prev, idTipoDespesa: event.target.value }))}
        aria-label="Tipo de despesa"
        className={controlClassName}
      >
        <option value="">Tipo de Despesa</option>
        {tiposDespesa.map((item) => (
          <option key={item.id} value={String(item.id)}>
            {`${item.id} - ${item.descricao}`}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="rounded-sm border border-[#E4EEF0] bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-[#1F2A32]">Financeiro - cadastro e atualizacao</h2>

      <form
        className="rounded-sm border border-[#E4EEF0] p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void handleCreate();
        }}
      >
        <h3 className="mb-2 text-base font-semibold text-[#1F2A32]">Cadastro</h3>
        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <select
            value={createTipo}
            onChange={(event) => setCreateTipo(event.target.value as 'despesa' | 'orcamento')}
            className={controlClassName}
            aria-label="Tipo de cadastro"
          >
            <option value="despesa">Cadastrar despesa</option>
            <option value="orcamento">Cadastrar orcamento</option>
          </select>
        </div>

        {renderFormFields(createTipo, createForm, setCreateForm)}

        <div className="mt-3 flex gap-2">
          <button type="submit" className="h-[46px] rounded-sm bg-[#2E8F63] px-4 font-semibold text-white transition hover:brightness-95">
            Cadastrar
          </button>
        </div>

        {createError && <p className="mt-2 text-sm text-red-600">{createError}</p>}
      </form>

      <form
        className="mt-4 rounded-sm border border-[#E4EEF0] p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void handleUpdate();
        }}
      >
        <h3 className="mb-2 text-base font-semibold text-[#1F2A32]">Atualizacao</h3>
        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <select
            value={updateTipo}
            onChange={(event) => {
              setUpdateTipo(event.target.value as 'despesa' | 'orcamento');
              setIdEditar('');
            }}
            className={controlClassName}
            aria-label="Tipo de atualizacao"
          >
            <option value="despesa">Atualizar despesa</option>
            <option value="orcamento">Atualizar orcamento</option>
          </select>

          <select
            value={idEditar}
            onChange={(event) => setIdEditar(event.target.value)}
            className={controlClassName}
            aria-label="Registro para atualizar"
          >
            <option value="">Selecione o ID para atualizar</option>
            {transacoesAtualizacao.map((item) => (
              <option key={`${item.tipo}-${item.id}`} value={String(item.id)}>
                {`${item.id} - ${item.descricao}`}
              </option>
            ))}
          </select>
        </div>

        {renderFormFields(updateTipo, updateForm, setUpdateForm)}

        <div className="mt-3 flex gap-2">
          <button type="submit" className="h-[46px] rounded-sm bg-[#0B6470] px-4 font-semibold text-white transition hover:brightness-95">
            Atualizar
          </button>
        </div>

        {updateError && <p className="mt-2 text-sm text-red-600">{updateError}</p>}
      </form>

      <p className="mt-3 text-sm text-[#72808A]">Registros carregados: {transacoes.length}</p>
    </div>
  );
}
