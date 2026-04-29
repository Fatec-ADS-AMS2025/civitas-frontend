import { GenericService } from './generic';
import DespesaDTO from '@/models/despesa';
import type { ListQuery } from './generic';

const mergeUniqueById = (despesas: DespesaDTO[]): DespesaDTO[] => {
  return Array.from(new Map(despesas.map((despesa) => [despesa.id, despesa])).values());
};

const toQueryString = (query?: ListQuery): string => {
  const params = new URLSearchParams();
  const page = query?.page ?? 1;
  const size = query?.size ?? 100;

  params.set('page', String(page));
  params.set('size', String(size));

  if (query?.sortBy) {
    params.set('sortBy', query.sortBy);
  }

  if (query?.sortDirection) {
    params.set('sortDirection', query.sortDirection);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export class DespesaService extends GenericService<DespesaDTO> {
  constructor() {
    super('despesas');
  }

  async getByFilters(filters?: {
    page?: number;
    size?: number;
  }): Promise<DespesaDTO[]> {
    return this.getAllStatusData(filters);
  }

  async getPagas(query?: ListQuery): Promise<DespesaDTO[]> {
    const response = await fetch(`${this.getUrlEndpoint()}/pagas${toQueryString(query)}`, {
      headers: this.createHeaders(),
    });
    const payload = await this.handleResponse(response, { showErrorToast: false });
    return this.unwrapCollection<DespesaDTO>(payload);
  }

  async getAtrasadas(query?: ListQuery): Promise<DespesaDTO[]> {
    const response = await fetch(`${this.getUrlEndpoint()}/atrasadas${toQueryString(query)}`, {
      headers: this.createHeaders(),
    });
    const payload = await this.handleResponse(response, { showErrorToast: false });
    return this.unwrapCollection<DespesaDTO>(payload);
  }

  async getPagasData(query?: ListQuery): Promise<DespesaDTO[]> {
    try {
      return await this.getPagas(query);
    } catch (error) {
      console.error('Erro ao listar despesas pagas:', error);
      return [];
    }
  }

  async getAtrasadasData(query?: ListQuery): Promise<DespesaDTO[]> {
    try {
      return await this.getAtrasadas(query);
    } catch (error) {
      console.error('Erro ao listar despesas atrasadas:', error);
      return [];
    }
  }

  async getAllStatusData(query?: ListQuery): Promise<DespesaDTO[]> {
    const [aPagar, pagas, atrasadas] = await Promise.all([
      this.getAllData(query),
      this.getPagasData(query),
      this.getAtrasadasData(query),
    ]);

    return mergeUniqueById([...(aPagar ?? []), ...(pagas ?? []), ...(atrasadas ?? [])]);
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
