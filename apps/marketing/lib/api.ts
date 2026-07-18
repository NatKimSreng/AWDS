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
