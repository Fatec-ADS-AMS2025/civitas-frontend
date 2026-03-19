const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5210/api';

export interface ApiResponse<T> {
  code?: number;
  data: T;
  success?: boolean;
  message?: string;
}

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

  private unwrapData<R>(payload: unknown): R {
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return (payload as ApiResponse<R>).data;
    }

    return payload as R;
  }

  getUrlEndpoint(): string {
    return `${BASE_URL}/${this.endpoint}`;
  }

  async getAll(): Promise<T[]> {
    const response = await fetch(`${this.getUrlEndpoint()}`);
    const payload = await this.handleResponse<unknown>(response);
    const data = this.unwrapData<unknown>(payload);

    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === 'object' && 'items' in data && Array.isArray((data as { items: unknown[] }).items)) {
      return (data as { items: T[] }).items;
    }

    return [];
  }

  async getById(id: number): Promise<T> {
    const response = await fetch(`${this.getUrlEndpoint()}/${id}`);
    const payload = await this.handleResponse<unknown>(response);
    return this.unwrapData<T>(payload);
  }

  async create(data: any): Promise<T> {
    const response = await fetch(`${this.getUrlEndpoint()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const payload = await this.handleResponse<unknown>(response);
    return this.unwrapData<T>(payload);
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    const response = await fetch(`${this.getUrlEndpoint()}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const payload = await this.handleResponse<unknown>(response);
    return this.unwrapData<T>(payload);
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${this.getUrlEndpoint()}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  }

  async alterarSituacao(id: number): Promise<void> {
    const response = await fetch(
      `${this.getUrlEndpoint()}/situacao/${id}`,
      {
        method: 'PATCH',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  }
}
