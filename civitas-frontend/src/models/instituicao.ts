export default interface InstituicaoDTO {
  id: number;
  nome: string;
  nomeRazaoSocial?: string;
  cnpj: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cep: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  situacao: number;
  idTipoInstituicao?: number;
  idSecretaria?: number;
}
