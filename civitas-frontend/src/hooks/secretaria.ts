import { GenericService } from './generic';
import SecretariaDTO from '@/models/secretaria';

export class SecretariaService extends GenericService<SecretariaDTO> {
  constructor() {
    super('secretaria');
  }
}

// Instância única do service para uso na aplicação
export const secretariaService = new SecretariaService();