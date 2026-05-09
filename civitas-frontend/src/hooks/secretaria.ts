import { GenericService } from './generic';
import SecretariaDTO from '@/models/secretaria';
import { SecretariaGastosDTO } from '@/models/financeiro';

export class SecretariaService extends GenericService<SecretariaDTO> {
  constructor() {
    super('secretarias');
  }

  async getGastos(id: number): Promise<SecretariaGastosDTO | null> {
    try {
      const response = await fetch(`${this.getUrlEndpoint()}/${id}/gastos`, {
        headers: this.createHeaders(),
      });
      const payload = await this.handleResponse(response, { showErrorToast: false });
      return this.unwrapItem<SecretariaGastosDTO>(payload);
    } catch (error) {
      console.error(`Erro ao buscar gastos da secretaria ${id}:`, error);
      return null;
    }
  }
}

// Instância única do service para uso na aplicação
export const secretariaService = new SecretariaService();
