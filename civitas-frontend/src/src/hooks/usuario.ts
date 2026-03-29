import { GenericService } from "./generic";
import UsuarioDTO from "@/models/usuario";

export class UsuarioService extends GenericService<UsuarioDTO> {
  constructor() {
    super('usuarios');
  }

  async getByCpf(cpf: string): Promise<UsuarioDTO | null> {
    try {
      const payload = await this.request<UsuarioDTO[] | { data: UsuarioDTO[] | null }>(
        `${this.getUrlEndpoint()}/cpf?cpf=${encodeURIComponent(cpf)}`
      );

      if (payload && typeof payload === 'object' && 'data' in payload) {
        const users = payload.data;
        return Array.isArray(users) ? users[0] ?? null : null;
      }

      return Array.isArray(payload) ? payload[0] ?? null : null;
    } catch (error) {
      console.error('Erro ao buscar usuario por CPF:', error);
      return null;
    }
  }
}

export const usuarioService = new UsuarioService();
