import { GenericService } from './generic';
import OrcamentoDTO from '@/models/orcamento';

export class OrcamentoService extends GenericService<OrcamentoDTO> {
  constructor() {
    super('orcamento');
  }

  // Override do método delete para usar o parâmetro correto
  async delete(id: number): Promise<void> {
    const response = await fetch(`${this.getUrlEndpoint()}${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  }

  // Override do update para usar idOrcamento
  async update(id: number, data: Partial<OrcamentoDTO>): Promise<OrcamentoDTO> {
    const response = await fetch(`${this.getUrlEndpoint()}${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<OrcamentoDTO>(response);
  }
}

export const orcamentoService = new OrcamentoService();