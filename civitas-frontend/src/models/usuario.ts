export default interface UsuarioDTO {
  id: number;
  nome: string;
  cpf: string;
  matricula: string;
  cidade: string;
  estado: string;
  email?: string;
  telefone?: string;
  situacao?: number;
  tipo: "Administrador" | "Cidadão" | "Funcionário";
}