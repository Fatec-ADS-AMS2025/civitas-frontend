import { GenericService } from './generic';
import InstituicaoDTO from '@/models/instituicao';

export class InstituicaoService extends GenericService<InstituicaoDTO> {
  constructor() {
    super('instituicoes');
  }

  async getByName(name: string): Promise<InstituicaoDTO[]> {
    try {
      const payload = await this.request<
        InstituicaoDTO[] | { data: InstituicaoDTO[] | null }
      >(`${this.getUrlEndpoint()}/nome?name=${encodeURIComponent(name)}`);

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
