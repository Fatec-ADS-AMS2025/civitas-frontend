import { GenericService } from './generic';
import SecretariaDTO from '@/models/secretaria';

export class SecretariaService extends GenericService<SecretariaDTO> {
  constructor() {
<<<<<<< 103-sprint-13---front---aprimoramento-do-formulário-genérico-fk-etapas-já-implementadas-mas-precisa-de-dupla-validação
    super("secretarias");
=======
    super('secretarias');
>>>>>>> dev
  }
}

// Instância única do service para uso na aplicação
export const secretariaService = new SecretariaService();
