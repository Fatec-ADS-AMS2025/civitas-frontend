export default interface InstituicaoDTO {
  id: number;
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
  idTipoInstituicao: number;
  idSecretaria: number;
}
