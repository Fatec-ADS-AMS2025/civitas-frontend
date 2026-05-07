import { GenericService } from './generic';
import UnidadeConsumidoraDTO from '@/models/unidadeConsumidora';

export class UnidadeConsumidoraService extends GenericService<UnidadeConsumidoraDTO> {
  constructor() {
    super('unidades-consumidoras');
  }

  async toggleStatusExclusao(id: number): Promise<void> {
    // Soft delete/restauração conforme endpoint do backend.
    const response = await fetch(`${this.getUrlEndpoint()}/${id}/status-exclusao`, {
      method: "PATCH",
      headers: this.createHeaders(),
    });

    await this.handleResponse(response, { showSuccessToast: true });
  }
}

export const unidadeConsumidoraService = new UnidadeConsumidoraService();
