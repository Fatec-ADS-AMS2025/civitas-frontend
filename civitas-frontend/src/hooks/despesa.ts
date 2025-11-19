import { GenericService } from './generic';
import DespesaDTO from '@/models/despesa';

export class DespesaService extends GenericService<DespesaDTO> {
  constructor() {
    super('despesa');
  }
}

export const despesaService = new DespesaService();