import type DocumentoDTO from "./documento";

export default interface DespesaDTO {
  id: number;
  numeroDocumento?: string;
  codigo?: string;
  valorPrevisto?: number;
  valorPago?: number;
  uc?: string;
  idUnidadeConsumidora?: number;
  dataEmissao?: string;
  dataEmicao?: string;
  consumoPrevisto?: number;
  consumoReal?: number;
  dataVencimento?: string;
  // Data de pagamento usada para impedir reclassificacao automatica como atrasada.
  dataPagamento?: string;
  status?: number;
  situacao?: number;
  idTipoDespesa?: number;
  idOrcamento?: number;
  idInstituicao?: number;
  idFornecedor?: number;
  idUsuario?: number;
  documento?: DocumentoDTO | null;

  // Legacy fields still consumed by existing financial UI mapping.
  descricao?: string;
  valor?: number;
  data?: string;
  categoria?: string;
  fornecedorId?: number;
  secretariaId?: number;
}
