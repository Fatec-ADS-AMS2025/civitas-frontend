import { GenericService } from './generic';
import InstituicaoDTO from '@/models/instituicao';

export class InstituicaoService extends GenericService<InstituicaoDTO> {
  constructor() {
    super('instituicoes');
  }

  async getByName(name: string): Promise<InstituicaoDTO[]> {
    try {
      const response = await fetch(`${this.getUrlEndpoint()}/nome?name=${encodeURIComponent(name)}`);
      const payload = await this.handleResponse<
        InstituicaoDTO[] | { data: InstituicaoDTO[] | null }
      >(response);

      if (payload && typeof payload === 'object' && 'data' in payload) {
        return Array.isArray(payload.data) ? payload.data : [];
      }

      return Array.isArray(payload) ? payload : [];
    } catch (error) {
      console.error('Erro ao buscar instituicoes por nome:', error);
      return [];
    }
  }
}

export const instituicaoService = new InstituicaoService();
