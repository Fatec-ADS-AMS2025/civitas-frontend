import { GenericService } from './generic';
import UnidadeMedidaDTO from '@/models/unidadeMedida';

export class UnidadeMedidaService extends GenericService<UnidadeMedidaDTO> {
  constructor() {
    super('unidade-medida');
  }
}

export const unidadeMedidaService = new UnidadeMedidaService();
