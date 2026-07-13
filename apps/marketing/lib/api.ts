const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

export async function apiFetch(path: string, options: RequestInit = {}): Promise<unknown> {
  try {
    const response = await fetch(`${API_URL}/api${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Fail fast during static builds if the API is not running.
      signal: AbortSignal.timeout?.(5000),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (typeof window === 'undefined') {
      // During static generation, return a safe fallback instead of failing.
      return { data: [] };
    }
    throw error;
  }
}

export async function fetchActivities(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  const data = (await apiFetch(`/public/activities?${query}`)) as { data: unknown[] };
  return data.data;
}

export async function fetchCategories() {
  const data = (await apiFetch('/public/categories')) as { data: unknown[] };
  return data.data;
}

export async function fetchCities() {
  const data = (await apiFetch('/public/cities')) as { data: unknown[] };
  return data.data;
}

export async function fetchActivity(slug: string) {
  const data = (await apiFetch(`/public/activities/${slug}`)) as { data: unknown };
  return data.data;
}
