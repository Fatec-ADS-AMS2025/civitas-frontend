import { GenericService } from './generic';
import type { ListQuery, PaginatedResult } from './generic';
import UnidadeConsumidoraDTO from '@/models/unidadeConsumidora';
import { filterActiveRecords } from '@/global/softDelete';

export class UnidadeConsumidoraService extends GenericService<UnidadeConsumidoraDTO> {
  constructor() {
    super('unidades-consumidoras');
  }

  private async getAllActiveItems(query?: ListQuery): Promise<UnidadeConsumidoraDTO[]> {
    const pageSize = query?.size ?? 100;
    let currentPage = 1;
    let totalPages = 1;
    const activeItems: UnidadeConsumidoraDTO[] = [];

    while (currentPage <= totalPages) {
      const page = await super.getPage({
        ...query,
        page: currentPage,
        size: pageSize,
      });

      activeItems.push(...page.items);

      if (page.totalPages <= 0) {
        break;
      }

      totalPages = page.totalPages;
      currentPage += 1;
    }

    return filterActiveRecords(activeItems);
  }

  override async getPage(query?: ListQuery): Promise<PaginatedResult<UnidadeConsumidoraDTO>> {
    const pageSize = query?.size ?? 100;
    const requestedPage = query?.page ?? 1;
    const activeItems = await this.getAllActiveItems(query);
    const totalRecords = activeItems.length;
    const activeTotalPages = totalRecords === 0 ? 0 : Math.ceil(totalRecords / pageSize);
    const safePage = activeTotalPages === 0 ? 1 : Math.min(requestedPage, activeTotalPages);
    const startIndex = (safePage - 1) * pageSize;

    return {
      items: activeItems.slice(startIndex, startIndex + pageSize),
      totalRecords,
      totalPages: activeTotalPages,
      currentPage: safePage,
      pageSize,
    };
  }

  async getAllActiveData(query?: Omit<ListQuery, "page">): Promise<UnidadeConsumidoraDTO[]> {
    return this.getAllActiveItems(query);
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
