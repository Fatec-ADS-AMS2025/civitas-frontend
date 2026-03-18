import { GenericService } from './generic';
import DespesaDTO from '@/models/despesa';

export class DespesaService extends GenericService<DespesaDTO> {
  constructor() {
    super("despesas");
  }
}

export const despesaService = new DespesaService();
