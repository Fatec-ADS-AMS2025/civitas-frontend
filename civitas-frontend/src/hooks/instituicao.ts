import { GenericService } from './generic';
import InstituicaoDTO from '@/models/instituicao';

export class InstituicaoService extends GenericService<InstituicaoDTO> {
  constructor() {
    super('instituicao');
  }
}

export const instituicaoService = new InstituicaoService();