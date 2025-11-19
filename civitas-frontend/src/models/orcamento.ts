export default interface OrcamentoDTO {
  idOrcamento: number;
  ano: number;
  valor: number;
  descricao?: string;
  situacao?: number;
}