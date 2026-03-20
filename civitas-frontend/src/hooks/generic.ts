const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5210/api";

export interface ResponseEnvelope<T> {
  code?: string;
  message?: string;
  data?: T | null;
}

export interface PaginatedResult<T> {
  items: T[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ListQuery {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

const DEFAULT_LIST_QUERY: Required<Pick<ListQuery, "page" | "size">> = {
  page: 1,
  size: 100,
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isResponseEnvelope = <T>(value: unknown): value is ResponseEnvelope<T> => {
  return isRecord(value) && "data" in value;
};

const isPaginatedResult = <T>(value: unknown): value is PaginatedResult<T> => {
  return isRecord(value) && Array.isArray(value.items);
};

const toQueryString = (query?: ListQuery): string => {
  const params = new URLSearchParams();
  const mergedQuery = { ...DEFAULT_LIST_QUERY, ...query };

  Object.entries(mergedQuery).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export class GenericService<T> {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  protected getUrlEndpoint(): string {
    return `${BASE_URL}/${this.endpoint}`;
  }

  protected async handleResponse(response: Response): Promise<unknown> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    if (response.status === 204) return undefined;

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return response.text();
  }

  protected unwrapItem<R>(payload: unknown): R {
    if (isResponseEnvelope<R>(payload)) {
      return payload.data as R;
    }

    return payload as R;
  }

  protected unwrapCollection<R>(payload: unknown): R[] {
    const data = isResponseEnvelope<unknown>(payload) ? payload.data : payload;

    if (Array.isArray(data)) {
      return data as R[];
    }

    if (isPaginatedResult<R>(data)) {
      return data.items;
    }

    return [];
  }

  async getAll(query?: ListQuery): Promise<T[]> {
    const response = await fetch(`${this.getUrlEndpoint()}${toQueryString(query)}`);
    const payload = await this.handleResponse(response);
    return this.unwrapCollection<T>(payload);
  }

  async getById(id: number): Promise<T> {
    const response = await fetch(`${this.getUrlEndpoint()}/${id}`);
    const payload = await this.handleResponse(response);
    return this.unwrapItem<T>(payload);
  }

  async create(data: unknown): Promise<T> {
    const response = await fetch(this.getUrlEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const payload = await this.handleResponse(response);
    return this.unwrapItem<T>(payload);
  }

  async createData(data: any): Promise<T> {
    const payload = await this.create(data);
    return this.extractData<T>(payload as unknown as T | ApiEnvelope<T> | ApiResponse<T>);
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    const response = await fetch(`${this.getUrlEndpoint()}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const payload = await this.handleResponse(response);
    return this.unwrapItem<T>(payload);
  }

  async updateData(id: number, data: Partial<T>): Promise<T> {
    const payload = await this.update(id, data);
    return this.extractData<T>(payload as unknown as T | ApiEnvelope<T> | ApiResponse<T>);
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${this.getUrlEndpoint()}/${id}`, {
      method: "DELETE",
    });

    await this.handleResponse(response);
  }

  async patch(id: number, data: Partial<T>): Promise<T> {
    const response = await fetch(`${this.getUrlEndpoint()}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const payload = await this.handleResponse(response);
    return this.unwrapItem<T>(payload);
  }

  async patchData(id: number, data: Partial<T>): Promise<T> {
    const payload = await this.patch(id, data);
    return this.extractData<T>(payload as unknown as T | ApiEnvelope<T> | ApiResponse<T>);
  }

  async alterarSituacao(id: number): Promise<void> {
    const response = await fetch(`${this.getUrlEndpoint()}/situacao/${id}`, {
      method: "PATCH",
    });

    await this.handleResponse(response);
  }
}
