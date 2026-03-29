import { showToast } from "@/hooks/useToast";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5210/api";

export interface ResponseEnvelope<T> {
  code?: string;
  message?: string;
  data?: T | null;
}

export type ApiEnvelope<T> = ResponseEnvelope<T>;
export type ApiResponse<T> = ResponseEnvelope<T>;

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

const isHttpNotFoundError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes("HTTP 404");
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

  protected async handleResponse<R = unknown>(response: Response): Promise<R> {
    if (response.status === 204) return undefined as R;

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      let errorText = "";
      let errorJson: any = null;

      try {
        if (contentType && contentType.includes("application/json")) {
          errorJson = await response.json();
        } else {
          errorText = await response.text();
        }
      } catch {
        errorText = "Erro ao processar resposta do servidor.";
      }

      const message =
        errorJson?.message ||
        errorText ||
        `Erro na requisição (${response.status})`;

      showToast(message, "error");

      throw new Error(`HTTP ${response.status}: ${message}`);
    }

    if (contentType && contentType.includes("application/json")) {
      const json = (await response.json()) as R;

      if (
        isRecord(json) &&
        typeof json.message === "string" &&
        json.message.trim() !== ""
      ) {
        showToast(json.message, "success");
      }

      return json;
    }

    return (await response.text()) as R;
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

  protected extractData<R>(payload: unknown): R {
    if (isResponseEnvelope<R>(payload)) {
      return payload.data as R;
    }

    return payload as R;
  }

  async getAll(query?: ListQuery): Promise<T[]> {
    const response = await fetch(`${this.getUrlEndpoint()}${toQueryString(query)}`);
    const payload = await this.handleResponse(response);
    return this.unwrapCollection<T>(payload);
  }

  async getAllData(query?: ListQuery): Promise<T[]> {
    try {
      return await this.getAll(query);
    } catch (error) {
      console.error(`Erro ao listar ${this.endpoint}:`, error);
      return [];
    }
  }

  async getById(id: number): Promise<T> {
    const response = await fetch(`${this.getUrlEndpoint()}/${id}`);
    const payload = await this.handleResponse(response);
    return this.unwrapItem<T>(payload);
  }

  async getByIdData(id: number): Promise<T | null> {
    try {
      return await this.getById(id);
    } catch (error) {
      if (isHttpNotFoundError(error)) {
        return null;
      }

      console.error(`Erro ao buscar ${this.endpoint} por ID ${id}:`, error);
      return null;
    }
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
    try {
      const payload = await this.create(data);
      return this.extractData<T>(payload as unknown as T | ApiEnvelope<T> | ApiResponse<T>);
    } catch (error) {
      console.error(`Erro ao criar ${this.endpoint}:`, error);
      throw error;
    }
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
    try {
      const payload = await this.update(id, data);
      return this.extractData<T>(payload as unknown as T | ApiEnvelope<T> | ApiResponse<T>);
    } catch (error) {
      console.error(`Erro ao atualizar ${this.endpoint} com ID ${id}:`, error);
      throw error;
    }
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
    try {
      const payload = await this.patch(id, data);
      return this.extractData<T>(payload as unknown as T | ApiEnvelope<T> | ApiResponse<T>);
    } catch (error) {
      console.error(`Erro ao atualizar parcialmente ${this.endpoint} com ID ${id}:`, error);
      throw error;
    }
  }

  async alterarSituacao(id: number): Promise<void> {
    const response = await fetch(`${this.getUrlEndpoint()}/situacao/${id}`, {
      method: "PATCH",
    });

    await this.handleResponse(response);
  }
}