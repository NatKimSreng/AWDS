import { apiFetch } from '@/lib/api';

export interface AvailabilitySlot {
  id: number;
  start_time: string;
  end_time: string | null;
  capacity: number;
  booked_count: number;
  remaining: number;
  price_override: string | null;
}

export interface AvailabilityDate {
  date: string;
  slots: AvailabilitySlot[];
}

export interface AvailabilityResponse {
  activity: {
    id: number;
    title: string;
    slug: string;
    min_group: number;
    max_group: number;
    duration_minutes: number;
    base_price_usd: string;
  };
  dates: AvailabilityDate[];
}

export async function fetchAvailability(
  slug: string,
  date?: string,
  dateFrom?: string,
  dateTo?: string
): Promise<AvailabilityResponse> {
  const params = new URLSearchParams();

  if (date) {
    params.append('date', date);
  } else if (dateFrom && dateTo) {
    params.append('date_from', dateFrom);
    params.append('date_to', dateTo);
  }

  const query = params.toString();
  const response = await apiFetch(
    `/public/activities/${encodeURIComponent(slug)}/availability${query ? `?${query}` : ''}`
  );

  return (response as { data: AvailabilityResponse }).data;
}

export interface CreateBookingPayload {
  time_slot_id: number;
  traveler_count: number;
  currency?: string;
  special_requests?: string;
}

export interface BookingResponse {
  id: number;
  booking_ref: string;
  status: string;
  activity: {
    id: number;
    title: string;
    slug: string;
  };
  time_slot: {
    id: number;
    date: string;
    start_time: string;
  };
  traveler_count: number;
  total_price: string;
  currency: string;
  expires_at: string;
}

export async function createBooking(payload: CreateBookingPayload): Promise<BookingResponse> {
  const response = await apiFetch('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return (response as { data: BookingResponse }).data;
}

export interface TicketResponse {
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

export async function fetchTicket(bookingId: number): Promise<TicketResponse> {
  const response = await apiFetch(`/bookings/${bookingId}/ticket`);
  return (response as { data: TicketResponse }).data;
}

export async function sendConfirmationEmail(bookingId: number): Promise<void> {
  await apiFetch(`/bookings/${bookingId}/send-confirmation-email`, {
    method: 'POST',
  });
}
