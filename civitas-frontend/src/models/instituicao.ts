export default interface InstituicaoDTO {
  id: number;
  nome: string;
  nomeRazaoSocial?: string;
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
  idTipoInstituicao?: number;
  idSecretaria?: number;
}