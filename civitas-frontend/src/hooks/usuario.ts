import { GenericService } from "./generic";
import UsuarioDTO from "@/models/usuario";

export class UsuarioService extends GenericService<UsuarioDTO> {
  constructor() {
    super("usuarios");
  }

  async getByCpf(cpf: string): Promise<UsuarioDTO> {
    const response = await fetch(`${this.getUrlEndpoint()}/cpf?cpf=${cpf}`);
    const payload = await this.handleResponse(response);
    const users = this.unwrapCollection<UsuarioDTO>(payload);

    if (users.length === 0) {
      throw new Error("Usuário não encontrado");
    }

    return users[0];
  }
}

export const usuarioService = new UsuarioService();
