import { GenericService } from './generic';
import DespesaDTO from '@/models/despesa';

export class DespesaService extends GenericService<DespesaDTO> {
  constructor() {
    super('despesas');
  }

  async getByFilters(filters?: {
    page?: number;
    size?: number;
  }): Promise<DespesaDTO[]> {
    return this.getAllData(filters);
  }
}

export const despesaService = new DespesaService();
