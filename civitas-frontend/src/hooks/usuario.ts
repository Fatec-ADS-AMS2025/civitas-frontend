import { GenericService } from './generic';
import UsuarioDTO from '@/models/usuario';

export class UsuarioService extends GenericService<UsuarioDTO> {
  constructor() {
    super('usuario');
  }

  async getByCpf(cpf: string): Promise<UsuarioDTO> {
    const response = await fetch(`${this.getUrlEndpoint()}GetUsuarioByCpf?cpf=${cpf}`);
    return this.handleResponse<UsuarioDTO>(response);
  }

}

export const usuarioService = new UsuarioService();