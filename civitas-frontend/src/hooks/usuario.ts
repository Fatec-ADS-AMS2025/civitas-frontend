import { GenericService } from './generic';
import UsuarioDTO from '@/models/usuario';

export class UsuarioService extends GenericService<UsuarioDTO> {
  constructor() {
    super('usuarios');
  }

  async getByCpf(cpf: string): Promise<UsuarioDTO[] | null> {
    const response = await fetch(
      `${this.getUrlEndpoint()}/cpf?cpf=${cpf}`
    );
    const payload = await this.handleResponse<unknown>(response);
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return (payload as { data: UsuarioDTO[] | null }).data;
    }

    return payload as UsuarioDTO[] | null;
  }
}

export const usuarioService = new UsuarioService();
