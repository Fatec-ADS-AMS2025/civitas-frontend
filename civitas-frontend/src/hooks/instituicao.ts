import { GenericService } from './generic';
import InstituicaoDTO from '@/models/instituicao';

export class InstituicaoService extends GenericService<InstituicaoDTO> {
  constructor() {
<<<<<<< 103-sprint-13---front---aprimoramento-do-formulário-genérico-fk-etapas-já-implementadas-mas-precisa-de-dupla-validação
    super("instituicoes");
=======
    super('instituicoes');
>>>>>>> dev
  }
}

export const instituicaoService = new InstituicaoService();
