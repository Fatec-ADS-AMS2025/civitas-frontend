const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5210/api';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiEnvelope<T> {
  code?: number;
  data: T;
  message?: string;
}

type PagedListPayload<R> = {
  items?: R[];
  records?: R[];
  resultados?: R[];
};

type QueryParamValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryParamValue>;

export class GenericService<T> {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  public async handleResponse<R>(response: Response): Promise<R> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text() as unknown as R;
  }

  protected extractData<R>(payload: R | ApiEnvelope<R> | ApiResponse<R>): R {
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return (payload as ApiEnvelope<R> | ApiResponse<R>).data;
    }

    return payload as R;
  }

  protected extractListData<R>(payload: unknown): R[] {
    if (Array.isArray(payload)) {
      return payload as R[];
    }

    if (payload && typeof payload === 'object') {
      const dataPayload = payload as { data?: unknown } & PagedListPayload<R>;

      if (Array.isArray(dataPayload.data)) {
        return dataPayload.data as R[];
      }

      if (dataPayload.data && typeof dataPayload.data === 'object') {
        const nestedData = dataPayload.data as PagedListPayload<R>;
        if (Array.isArray(nestedData.items)) return nestedData.items;
        if (Array.isArray(nestedData.records)) return nestedData.records;
        if (Array.isArray(nestedData.resultados)) return nestedData.resultados;
      }

      if (Array.isArray(dataPayload.items)) return dataPayload.items;
      if (Array.isArray(dataPayload.records)) return dataPayload.records;
      if (Array.isArray(dataPayload.resultados)) return dataPayload.resultados;
    }

    return [];
  }

  protected buildQueryString(queryParams?: QueryParams): string {
    if (!queryParams) {
      return '';
    }

    const searchParams = new URLSearchParams();

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      searchParams.append(key, String(value));
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  protected buildUrl(path = '', queryParams?: QueryParams): string {
    const normalizedPath = path ? `/${path.replace(/^\/+/, '')}` : '';
    return `${BASE_URL}/${this.endpoint}${normalizedPath}${this.buildQueryString(queryParams)}`;
  }

  async getAll(): Promise<T[]> {
    const response = await fetch(this.buildUrl());
    return this.handleResponse<T[]>(response);
  }

  async getAllWithParams(queryParams?: QueryParams): Promise<unknown> {
    const response = await fetch(this.buildUrl('', queryParams));
    return this.handleResponse<unknown>(response);
  }

  async getAllData(queryParams?: QueryParams): Promise<T[]> {
    const payload = await this.getAllWithParams(queryParams);
    return this.extractListData<T>(payload);
  }

  getUrlEndpoint(): string {
    return `${BASE_URL}/${this.endpoint}/`;
  }

  async getById(id: number): Promise<T> {
    const response = await fetch(this.buildUrl(String(id)));
    return this.handleResponse<T>(response);
  }

  async getByIdData(id: number): Promise<T> {
    const payload = await this.getById(id);
    return this.extractData<T>(payload as unknown as T | ApiEnvelope<T> | ApiResponse<T>);
  }

  async create(data: any): Promise<T> {
    const response = await fetch(this.buildUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async createData(data: any): Promise<T> {
    const payload = await this.create(data);
    return this.extractData<T>(payload as unknown as T | ApiEnvelope<T> | ApiResponse<T>);
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    const response = await fetch(this.buildUrl(String(id)), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async updateData(id: number, data: Partial<T>): Promise<T> {
    const payload = await this.update(id, data);
    return this.extractData<T>(payload as unknown as T | ApiEnvelope<T> | ApiResponse<T>);
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(this.buildUrl(String(id)), {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  }

  async patch(id: number, data: Partial<T>): Promise<T> {
    const response = await fetch(this.buildUrl(String(id)), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async patchData(id: number, data: Partial<T>): Promise<T> {
    const payload = await this.patch(id, data);
    return this.extractData<T>(payload as unknown as T | ApiEnvelope<T> | ApiResponse<T>);
  }

  async alterarSituacao(id: number): Promise<void> {
    const response = await fetch(this.buildUrl(`situacao/${id}`), {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  }
}