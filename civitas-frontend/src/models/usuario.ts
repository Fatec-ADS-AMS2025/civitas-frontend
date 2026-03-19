export default interface UsuarioDTO {
  id: number;
  cpf: string;
  nome: string;
  rg: string;
  logradouro: string;
  numero: string;
  matricula: string;
  cidade: string;
  estado: string;
  cep: string;
  bairro: string;
  email: string;
  senha: string;
  situacao: number;
  tipoUsuario: number;
}