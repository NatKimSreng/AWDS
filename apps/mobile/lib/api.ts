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

  const url = `${API_URL}/api${path}`;

  let response: Response;
  try {
    response = await fetchWithTimeout(url, {
      ...options,
      headers,
    });
  } catch (err) {
    const message = err instanceof Error && err.name === 'AbortError'
      ? `Request timed out after ${API_TIMEOUT / 1000}s`
      : `Cannot connect to API at ${API_URL}. Make sure the backend is running and reachable.`;
    throw new ApiError(message, 0);
  }

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

  const url = `${API_URL}/api${path}`;

  let response: Response;
  try {
    response = await fetchWithTimeout(url, {
      ...options,
      headers,
    });
  } catch (err) {
    const message = err instanceof Error && err.name === 'AbortError'
      ? `Request timed out after ${API_TIMEOUT / 1000}s`
      : `Cannot connect to API at ${API_URL}. Make sure the backend is running and reachable.`;
    throw new ApiError(message, 0);
  }

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

export async function testApiConnection(): Promise<{ ok: boolean; message: string; url: string }> {
  try {
    await fetchWithTimeout(`${API_URL}/api/public/categories`, { method: 'GET' });
    return { ok: true, message: 'Connected successfully', url: API_URL };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Connection failed',
      url: API_URL,
    };
  }
}

export { ApiError };
