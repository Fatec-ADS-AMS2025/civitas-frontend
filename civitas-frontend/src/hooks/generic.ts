const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5210/api';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
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

  async getAll(): Promise<T[]> {
    const response = await fetch(`${BASE_URL}/${this.endpoint}`);
    return this.handleResponse<T[]>(response);
  }

  async getUrlEndpoint(): Promise<string> {
    return `${BASE_URL}/${this.endpoint}/`;
  }

  async getById(id: number): Promise<T> {
    const response = await fetch(`${BASE_URL}/${this.endpoint}/${id}`);
    return this.handleResponse<T>(response);
  }

  async create(data: any): Promise<T> {
    console.log(data)
    const response = await fetch(`${BASE_URL}/${this.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    const response = await fetch(`${BASE_URL}/${this.endpoint}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  }

  async patch(id: number, data: Partial<T>): Promise<T> {
    const response = await fetch(`${BASE_URL}/${this.endpoint}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async alterarSituacao(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/${this.endpoint}/${id}/alterar-situacao`, {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  }
}