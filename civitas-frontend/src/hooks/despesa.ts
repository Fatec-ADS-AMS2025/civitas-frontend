import { GenericService } from './generic';
import DespesaDTO from '@/models/despesa';
import type DocumentoDTO from '@/models/documento';
import type { ListQuery } from './generic';
import { filterActiveRecords } from '@/global/softDelete';
import { base64ToDocumentBlob, getDocumentFileName, getDocumentMimeType } from '@/lib/documento-utils';

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

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const appendIfPresent = (formData: FormData, key: string, value: unknown): void => {
  if (value === undefined || value === null || value === '') return;
  formData.append(key, String(value));
};

const appendDocumentoIfPresent = (formData: FormData, documento: unknown): void => {
  if (!isRecord(documento) || documento.isPersisted === true) return;

  const digitalizacao =
    typeof documento.digitalizacao === 'string' ? documento.digitalizacao.trim() : '';
  if (!digitalizacao) return;

  const fileName = getDocumentFileName(
    typeof documento.fileName === 'string' ? documento.fileName : undefined
  );
  const fileType = getDocumentMimeType(
    fileName,
    typeof documento.fileType === 'string' ? documento.fileType : undefined
  );

  formData.append('Documento', base64ToDocumentBlob(digitalizacao, fileType, fileName), fileName);
};

const buildDespesaFormData = (data: Partial<DespesaDTO>): FormData => {
  const formData = new FormData();

  appendIfPresent(formData, 'Id', data.id);
  appendIfPresent(formData, 'NumeroDocumento', data.numeroDocumento);
  appendIfPresent(formData, 'Codigo', data.codigo);
  appendIfPresent(formData, 'DataEmissao', data.dataEmissao ?? data.dataEmicao);
  appendIfPresent(formData, 'ValorPrevisto', data.valorPrevisto ?? data.valor);
  appendIfPresent(formData, 'ValorPago', data.valorPago);
  appendIfPresent(formData, 'Juros', 0);
  appendIfPresent(formData, 'Multa', 0);
  appendIfPresent(formData, 'Desconto', 0);
  appendIfPresent(formData, 'ConsumoPrevisto', data.consumoPrevisto);
  appendIfPresent(formData, 'ConsumoReal', data.consumoReal);
  appendIfPresent(formData, 'DataVencimento', data.dataVencimento);
  appendIfPresent(formData, 'DataPagamento', data.dataPagamento);
  appendIfPresent(formData, 'Status', data.status ?? data.situacao);
  appendIfPresent(formData, 'IdUsuario', data.idUsuario);
  appendIfPresent(formData, 'IdUnidadeConsumidora', data.idUnidadeConsumidora);
  appendIfPresent(formData, 'ValoresOpcionais', data.valoresOpcionais);
  appendIfPresent(formData, 'ConfirmarDocumentoDuplicado', data.confirmarDocumentoDuplicado ?? false);
  appendDocumentoIfPresent(formData, data.documento as DocumentoDTO | undefined);

  return formData;
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
    return filterActiveRecords(this.unwrapCollection<DespesaDTO>(payload));
  }

  async getAtrasadas(query?: ListQuery): Promise<DespesaDTO[]> {
    const response = await fetch(`${this.getUrlEndpoint()}/atrasadas${toQueryString(query)}`, {
      headers: this.createHeaders(),
    });
    const payload = await this.handleResponse(response, { showErrorToast: false });
    return filterActiveRecords(this.unwrapCollection<DespesaDTO>(payload));
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

    return filterActiveRecords(
      mergeUniqueById([...(aPagar ?? []), ...(pagas ?? []), ...(atrasadas ?? [])])
    );
  }

  async getInactiveOptional(query?: ListQuery): Promise<DespesaDTO[]> {
    const params = new URLSearchParams();
    const page = query?.page ?? 1;
    const size = query?.size ?? 100;

    params.set('page', String(page));
    params.set('size', String(size));

    const response = await fetch(`${this.getUrlEndpoint()}/excluidos?${params.toString()}`, {
      headers: this.createHeaders(),
    });
    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    return this.unwrapCollection<DespesaDTO>(payload);
  }

  async createFromDashboard(data: DespesaDTO): Promise<DespesaDTO> {
    const response = await fetch(this.getUrlEndpoint(), {
      method: 'POST',
      headers: this.createHeaders(),
      body: buildDespesaFormData(data),
    });

    const payload = await this.handleResponse(response, {
      showErrorToast: false,
      showSuccessToast: false,
    });
    return this.unwrapItem<DespesaDTO>(payload);
  }

  async updateFromDashboard(id: number, data: Partial<DespesaDTO>): Promise<DespesaDTO> {
    const response = await fetch(`${this.getUrlEndpoint()}/${id}`, {
      method: 'PUT',
      headers: this.createHeaders(),
      body: buildDespesaFormData({ ...data, id }),
    });

    const payload = await this.handleResponse(response, {
      showErrorToast: false,
      showSuccessToast: false,
    });
    return this.unwrapItem<DespesaDTO>(payload);
  }

  override async createData(data: DespesaDTO): Promise<DespesaDTO> {
    return this.createFromDashboard(data);
  }

  override async updateData(id: number, data: Partial<DespesaDTO>): Promise<DespesaDTO> {
    return this.updateFromDashboard(id, data);
  }

  override async delete(id: number): Promise<void> {
    const response = await fetch(`${this.getUrlEndpoint()}/${id}/status-exclusao`, {
      method: 'PATCH',
      headers: this.createHeaders(),
    });

    await this.handleResponse(response, { showSuccessToast: true });
  }

  async getDocumentoBlobByHash(hashDocumento: string): Promise<Blob> {
    const response = await fetch(`${this.getUrlEndpoint()}/documento/${hashDocumento}`, {
      headers: this.createHeaders(),
    });

    if (!response.ok) {
      await this.handleResponse(response, { showErrorToast: false });
    }

    return response.blob();
  }

  async alterarStatusFromDashboard(id: number, status: number): Promise<void> {
    const response = await fetch(`${this.getUrlEndpoint()}/${id}/status`, {
      method: 'PATCH',
      headers: this.createHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(status),
    });

    await this.handleResponse(response, { showErrorToast: false });
  }
}

export const despesaService = new DespesaService();
