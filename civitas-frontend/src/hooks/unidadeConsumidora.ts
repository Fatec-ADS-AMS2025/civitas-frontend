import { GenericService } from './generic';
import type { ListQuery } from './generic';
import UnidadeConsumidoraDTO from '@/models/unidadeConsumidora';

export class UnidadeConsumidoraService extends GenericService<UnidadeConsumidoraDTO> {
  constructor() {
    super('unidades-consumidoras');
  }

  async getAllActiveData(query?: Omit<ListQuery, "page">): Promise<UnidadeConsumidoraDTO[]> {
    const pageSize = query?.size ?? 100;
    let currentPage = 1;
    let totalPages = 1;
    const items: UnidadeConsumidoraDTO[] = [];

    while (currentPage <= totalPages) {
      const page = await this.getPage({
        ...query,
        page: currentPage,
        size: pageSize,
      });

      items.push(...page.items);

      if (page.totalPages <= 0) {
        break;
      }

      totalPages = page.totalPages;
      currentPage += 1;
    }

    return items;
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
