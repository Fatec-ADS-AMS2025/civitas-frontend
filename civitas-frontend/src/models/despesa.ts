export default interface DespesaDTO {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  situacao: number;
  fornecedorId?: number;
  secretariaId?: number;
}