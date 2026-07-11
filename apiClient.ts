const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, string[]>;

  constructor(status: number, code: string, message: string, details?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : undefined;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.error?.code ?? "UNKNOWN_ERROR",
      body?.error?.message ?? "Something went wrong.",
      body?.error?.details
    );
  }

  return body as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data ?? {}),
    }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(data ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
