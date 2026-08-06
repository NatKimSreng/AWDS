export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

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
      signal: AbortSignal.timeout?.(8000),
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

import type { Activity } from "./types";

// ...existing code...

export async function fetchActivities(params: Record<string, string> = {}): Promise<Activity[]> {
  const query = new URLSearchParams(params).toString();
  const data = (await apiFetch(`/public/activities?${query}`)) as { data: Activity[] };
  return data.data;
}

export async function fetchCategories() {
  const data = (await apiFetch('/public/categories')) as { data: unknown[] };
  return data.data;
}

export async function fetchServiceTypes() {
  const data = (await apiFetch('/public/service-types')) as { data: unknown[] };
  return data.data;
}

export async function fetchTransportModes() {
  const data = (await apiFetch('/public/transport-modes')) as { data: unknown[] };
  return data.data;
}

export async function fetchCities() {
  const data = (await apiFetch('/public/cities')) as { data: unknown[] };
  return data.data;
}

export async function fetchActivity(slug: string) {
  const data = (await apiFetch(`/public/activities/${slug}`)) as { data: unknown };
  return data.data && typeof data.data === 'object' && !Array.isArray(data.data)
    ? data.data
    : null;
}

export async function fetchAvailability(slug: string, dateFrom?: string, dateTo?: string) {
  const params: Record<string, string> = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;
  const query = new URLSearchParams(params).toString();
  const data = (await apiFetch(`/public/activities/${slug}/availability?${query}`)) as {
    data: { dates: unknown[]; activity: unknown } };
  return data.data;
}

export async function fetchActivityReviews(slug: string) {
  const data = (await apiFetch(`/public/activities/${slug}/reviews`)) as { data: unknown[] };
  return data.data;
}

// Providers

export interface ProviderSummary {
  id: number;
  slug: string;
  business_name: string;
  tagline: string | null;
  bio: string | null;
  service_area: string | null;
  avg_rating: number;
  total_bookings: number;
  activities_count: number;
  founded_year: number | null;
  team_size: number | null;
  logo_url: string | null;
  cover_image_url: string | null;
  spoken_languages: string[];
  specialties: string[];
}

export interface ProviderActivity {
  id: number;
  title: string;
  slug: string;
  duration_minutes: number;
  min_group: number;
  max_group: number;
  base_price_usd: string;
  avg_rating: number;
  reviews_count: number;
  is_featured: boolean;
  is_instant_book: boolean;
  category: { id: number; name: string; slug: string; icon: string | null } | null;
  city: { id: number; name: string; slug: string } | null;
  provider: { id: number; business_name: string; avg_rating?: number } | null;
  hero_image: string | null;
}

export interface ProviderDetail extends ProviderSummary {
  certifications: string[];
  website_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  activities: ProviderActivity[];
}

export async function fetchProviders(): Promise<ProviderSummary[]> {
  const data = (await apiFetch('/public/providers')) as { data: unknown[] };
  return Array.isArray(data.data) ? (data.data as ProviderSummary[]) : [];
}

export async function fetchProvider(id: number | string): Promise<ProviderDetail | null> {
  const data = (await apiFetch(`/public/providers/${id}`)) as { data: unknown };
  return data.data && typeof data.data === 'object' && !Array.isArray(data.data)
    ? (data.data as ProviderDetail)
    : null;
}

// Guest booking API

export interface GuestBookingPayload {
  time_slot_id: number;
  traveler_count: number;
  currency?: string;
  special_requests?: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
}

export interface GuestBookingResponse {
  id: number;
  booking_ref: string;
  status: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  activity: {
    id: number;
    title: string;
    slug: string;
    hero_image?: string | null;
  } | null;
  time_slot: {
    id: number;
    date: string;
    start_time: string;
  } | null;
  traveler_count: number;
  total_price: string;
  currency: string;
  special_requests?: string;
  expires_at: string;
}

export async function createGuestBooking(payload: GuestBookingPayload): Promise<GuestBookingResponse> {
  const response = (await apiFetch('/public/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })) as { data: GuestBookingResponse };
  return response.data;
}

export async function fetchGuestBooking(bookingRef: string): Promise<GuestBookingResponse> {
  const response = (await apiFetch(`/public/bookings/${encodeURIComponent(bookingRef)}`)) as {
    data: GuestBookingResponse;
  };
  return response.data;
}

export interface GuestTicketResponse {
  ticket_ref: string;
  booking_ref: string;
  status: string;
  booking_status: string;
  activity: string;
  date: string;
  time: string;
  travelers: number;
  total_price: string;
  currency: string;
  qr_data_uri: string;
  qr_payload: Record<string, unknown>;
  provider: string;
}

export async function fetchGuestTicket(
  bookingRef: string,
  guestEmail: string
): Promise<GuestTicketResponse> {
  const response = (await apiFetch(`/public/bookings/${encodeURIComponent(bookingRef)}/ticket`, {
    method: 'POST',
    body: JSON.stringify({ guest_email: guestEmail }),
  })) as { data: GuestTicketResponse };
  return response.data;
}

export async function sendGuestConfirmationEmail(bookingRef: string, guestEmail: string): Promise<void> {
  await apiFetch(`/public/bookings/${encodeURIComponent(bookingRef)}/send-confirmation-email`, {
    method: 'POST',
    body: JSON.stringify({ guest_email: guestEmail }),
  });
}

export interface KhqrResponse {
  payment_id: number;
  booking_ref: string;
  qr: string;
  md5: string;
  amount: string;
  currency: string;
  expires_at: string;
}

export async function generateGuestKhqr(bookingRef: string, guestEmail: string): Promise<KhqrResponse> {
  const response = (await apiFetch(
    `/public/bookings/${encodeURIComponent(bookingRef)}/payments/khqr`,
    {
      method: 'POST',
      body: JSON.stringify({ guest_email: guestEmail }),
    }
  )) as { data: KhqrResponse };
  return response.data;
}

export interface KhqrStatusResponse {
  payment_id: number;
  status: string;
  booking_status: string;
  paid_at?: string;
}

export async function checkGuestKhqrStatus(
  paymentId: number,
  bookingRef: string
): Promise<KhqrStatusResponse> {
  const params = new URLSearchParams({ booking_ref: bookingRef });
  const response = (await apiFetch(
    `/public/payments/${paymentId}/khqr-status?${params.toString()}`
  )) as { data: KhqrStatusResponse };
  return response.data;
}
