import { API_URL, API_TIMEOUT } from '@/constants/api';
import { getToken } from '@/lib/secureStorage';

interface RequestOptions extends RequestInit {
  timeout?: number;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithTimeout(
  input: string,
  options: RequestOptions = {}
): Promise<Response> {
  const { timeout = API_TIMEOUT, ...init } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export async function apiFetch(
  path: string,
  options: RequestOptions = {}
): Promise<unknown> {
  const token = await getToken();
  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetchWithTimeout(`${API_URL}/api${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new ApiError(
      data?.message ?? `Request failed with status ${response.status}`,
      response.status,
      data ?? undefined
    );
  }

  return data;
}

export async function apiFetchMultipart(
  path: string,
  options: RequestOptions = {}
): Promise<unknown> {
  const token = await getToken();
  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');
  headers.delete('Content-Type');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetchWithTimeout(`${API_URL}/api${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new ApiError(
      data?.message ?? `Request failed with status ${response.status}`,
      response.status,
      data ?? undefined
    );
  }

  return data;
}

export { ApiError };
