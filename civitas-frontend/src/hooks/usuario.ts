import { GenericService } from "./generic";
import UsuarioDTO from "@/models/usuario";

export class UsuarioService extends GenericService<UsuarioDTO> {
  constructor() {
    super('usuarios');
  }

  async getByCpf(cpf: string): Promise<UsuarioDTO | null> {
    const response = await fetch(`${this.getUrlEndpoint()}cpf?cpf=${cpf}`);
    const payload = await this.handleResponse<UsuarioDTO[] | { data: UsuarioDTO[] | null }>(response);

    if (payload && typeof payload === 'object' && 'data' in payload) {
      const users = payload.data;
      return Array.isArray(users) ? users[0] ?? null : null;
    }

    return Array.isArray(payload) ? payload[0] ?? null : null;
  }

    return users[0];
  }
}

export const usuarioService = new UsuarioService();
