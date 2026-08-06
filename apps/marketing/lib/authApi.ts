import { API_URL } from "./api";
import { getStoredToken, setStoredToken, useAuthStore, type User } from "@/stores/authStore";

const TOKEN_KEY = "marketing-sanctum-token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return getStoredToken() ?? localStorage.getItem(TOKEN_KEY);
}

function clearAuth() {
  useAuthStore.getState().clearAuth();
}

async function authFetch(
  path: string,
  options: RequestInit = {}
): Promise<unknown> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuth();
    throw new Error("Session expired. Please sign in again.");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    console.error("[authFetch] error response:", {
      path,
      status: response.status,
      body,
    });

    // Laravel validation errors come nested under `errors`.
    const firstValidationError = body.errors
      ? Object.values(body.errors as Record<string, string[]>)[0]?.[0]
      : undefined;

    throw new Error(
      body.message ||
        firstValidationError ||
        body.error ||
        `API error: ${response.status}`
    );
  }

  return response.json();
}

export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  console.log("[login] attempting:", { email, apiUrl: API_URL });
  const data = (await authFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, device_name: "marketing-web" }),
  })) as { user: User; token: string };

  setStoredToken(data.token);
  useAuthStore.getState().setAuth(data.user, data.token);
  console.log("[login] success:", { userId: data.user.id, email: data.user.email });
  return data;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

export async function register(payload: RegisterPayload): Promise<{ user: User; token: string }> {
  const data = (await authFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as { user: User; token: string };

  setStoredToken(data.token);
  useAuthStore.getState().setAuth(data.user, data.token);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await authFetch("/auth/logout", { method: "POST" });
  } catch {
    // ignore
  } finally {
    clearAuth();
  }
}

export async function fetchProfile(): Promise<User> {
  const data = (await authFetch("/profile")) as { data: User };
  useAuthStore.getState().updateUser(data.data);
  return data.data;
}

export interface ProfileUpdatePayload {
  name?: string;
  phone?: string | null;
  language_pref?: string;
  avatar_url?: string | null;
  date_of_birth?: string | null;
  country?: string | null;
  nationality?: string | null;
  address?: string | null;
  bio?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
}

export async function updateProfile(payload: ProfileUpdatePayload): Promise<User> {
  const data = (await authFetch("/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  })) as { data: User };
  useAuthStore.getState().updateUser(data.data);
  return data.data;
}

export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${API_URL}/api/profile/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken() ?? ""}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Upload failed: ${response.status}`);
  }

  const data = (await response.json()) as { data: { avatar_url: string } };
  useAuthStore.getState().updateUser({ avatar_url: data.data.avatar_url });
  return data.data.avatar_url;
}

export interface BookingSummary {
  id: number;
  booking_ref: string;
  status: string;
  total_price: string;
  currency: string;
  traveler_count: number;
  created_at: string;
  activity: { id: number; title: string; slug: string; hero_image?: string | null } | null;
  time_slot: { date: string; start_time: string } | null;
}

export async function fetchMyBookings(): Promise<BookingSummary[]> {
  const data = (await authFetch("/bookings")) as { data: BookingSummary[] };
  return data.data ?? [];
}

export interface FavoriteItem {
  id: number;
  activity: {
    id: number;
    slug: string;
    title: string;
    base_price_usd: string;
    duration_minutes: number;
    min_group: number;
    max_group: number;
    avg_rating: number;
    reviews_count: number;
    is_featured: boolean;
    is_instant_book: boolean;
    category: { name: string; slug: string } | null;
    city: { name: string; slug: string } | null;
    provider: { business_name: string } | null;
    hero_image: string | null;
  };
}

export async function fetchFavorites(): Promise<FavoriteItem[]> {
  const data = (await authFetch("/favorites")) as { data: FavoriteItem[] };
  return data.data ?? [];
}

export async function toggleFavorite(activityId: number): Promise<boolean> {
  const data = (await authFetch("/favorites", {
    method: "POST",
    body: JSON.stringify({ activity_id: activityId }),
  })) as { data: { is_favorite: boolean } };
  return data.data.is_favorite;
}

export async function fetchFavoriteStatus(activityId: number): Promise<boolean> {
  const data = (await authFetch(`/activities/${activityId}/favorite`)) as {
    data: { is_favorite: boolean };
  };
  return data.data.is_favorite;
}
