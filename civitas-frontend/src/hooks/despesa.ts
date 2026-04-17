import { GenericService } from './generic';
import DespesaDTO from '@/models/despesa';
import type { ListQuery } from './generic';

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

  async getInactiveOptional(query?: ListQuery): Promise<DespesaDTO[]> {
    const params = new URLSearchParams();
    const page = query?.page ?? 1;
    const size = query?.size ?? 100;

    params.set('page', String(page));
    params.set('size', String(size));

    const response = await fetch(`${this.getUrlEndpoint()}/inativos?${params.toString()}`);
    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    return this.unwrapCollection<DespesaDTO>(payload);
  }
}

export const despesaService = new DespesaService();
