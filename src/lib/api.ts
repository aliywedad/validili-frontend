const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export function uploadUrl(path: string): string {
  return `${BASE_URL}/api/uploads/${path}`;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.error ?? message;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, { credentials: 'include' });
  return handle<T>(res);
}

export async function apiJson<T>(path: string, method: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handle<T>(res);
}

export async function apiForm<T>(path: string, method: string, formData: FormData): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    credentials: 'include',
    body: formData,
  });
  return handle<T>(res);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, { method: 'DELETE', credentials: 'include' });
  return handle<T>(res);
}
