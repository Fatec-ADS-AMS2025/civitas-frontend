export default interface InstituicaoDTO {
  id: number;
  nome: string;
  nomeRazaoSocial?: string;
  cnpj: string;
  nome: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cep: string;
  nomeRazaoSocial: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  situacao: number;
  idTipoInstituicao?: number;
  idSecretaria?: number;
}
