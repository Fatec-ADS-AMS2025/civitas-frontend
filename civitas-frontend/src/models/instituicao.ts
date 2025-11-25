export default interface InstituicaoDTO {
  id: number;
  nome: string;
  razaoSocial?: string;
  cnpj: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  telefone: string;
  email: string;
  situacao: number;
}