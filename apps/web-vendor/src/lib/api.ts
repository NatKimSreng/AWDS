import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000',
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sanctum-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ProviderApplication {
  id: number;
  business_name: string;
  bio: string | null;
  service_area: string | null;
  verification_status: string;
  onboarding_status: string | null;
  id_document_url: string | null;
  license_document_url: string | null;
  commission_rate: number;
  payout_accounts: {
    id: number;
    method: string;
    account_name: string;
    account_number: string;
    is_default: boolean;
  }[];
}

export async function getOnboardingApplication(): Promise<ProviderApplication> {
  const response = await api.get('/api/provider/onboarding');
  return response.data.data;
}

export async function saveBusinessInfo(data: {
  business_name: string;
  bio?: string;
  service_area?: string;
}): Promise<ProviderApplication> {
  const response = await api.post('/api/provider/onboarding/business', data);
  return response.data.data;
}

export async function saveDocuments(files: {
  id_document: File;
  license_document?: File | null;
}): Promise<ProviderApplication> {
  const formData = new FormData();
  formData.append('id_document', files.id_document);
  if (files.license_document) {
    formData.append('license_document', files.license_document);
  }

  const response = await api.post('/api/provider/onboarding/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
}

export async function savePayoutAccount(data: {
  method: string;
  account_name: string;
  account_number: string;
}): Promise<ProviderApplication> {
  const response = await api.post('/api/provider/onboarding/payout', data);
  return response.data.data;
}

export async function submitApplication(): Promise<ProviderApplication> {
  const response = await api.post('/api/provider/onboarding/submit');
  return response.data.data;
}

export interface VendorDashboardStats {
  total_listings: number;
  live_listings: number;
  pending_listings: number;
  draft_listings: number;
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_earnings_gross: number;
  total_commission: number;
  current_balance: number;
  unread_messages: number;
  recent_bookings: VendorBooking[];
}

export interface VendorListing {
  id: number;
  title: string;
  slug: string;
  duration_minutes: number;
  min_group: number;
  max_group: number;
  base_price_usd: number;
  status: string;
  is_instant_book: boolean;
  is_featured: boolean;
  category: { id: number; name: string; slug: string } | null;
  city: { id: number; name: string; slug: string } | null;
  hero_image: string | null;
  description?: string;
  itinerary?: Array<{ time: string; description: string }>;
  inclusions?: string;
  exclusions?: string;
  meeting_point?: {
    address: string | null;
    lat: number | null;
    lng: number | null;
  };
  spoken_languages?: string[];
  gallery?: Array<{ id: number; url: string; is_hero: boolean; sort_order: number }>;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface VendorTimeSlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string | null;
  capacity: number;
  booked_count: number;
  remaining: number;
  is_blackout: boolean;
  price_override: number | null;
}

export interface VendorBooking {
  id: number;
  booking_ref: string;
  status: string;
  booking_date: string | null;
  booking_time: string | null;
  traveler_count: number;
  total_price: number;
  commission_amount: number;
  currency: string;
  payment_method: string | null;
  special_requests: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  activity: { id: number; title: string; slug: string } | null;
  customer: { id?: number; name: string | null; email?: string | null; phone?: string | null } | null;
  time_slot: { id: number; date: string; start_time: string } | null;
  addons?: Array<{ id: number; name: string; price: number }>;
  status_history?: Array<{
    status: string;
    changed_by_type: string | null;
    note: string | null;
    created_at: string;
  }>;
}

export interface VendorEarningSummary {
  gross: number;
  commission: number;
  net: number;
  bookings: number;
  monthly: Array<{
    month: string;
    gross: number;
    commission: number;
    net: number;
    bookings: number;
  }>;
}

export interface VendorPayout {
  id: number;
  period_start: string;
  period_end: string;
  gross_amount: number;
  commission: number;
  net_amount: number;
  status: string;
  payout_method: string | null;
  transaction_ref: string | null;
  paid_at: string | null;
}

export interface VendorSettings {
  business_name: string;
  bio: string | null;
  service_area: string | null;
  commission_rate: number;
  payout_account: {
    id: number;
    method: string;
    account_name: string;
    account_number: string;
  } | null;
}

export async function getDashboardStats(): Promise<VendorDashboardStats> {
  const response = await api.get('/api/vendor/dashboard');
  return response.data.data;
}

export async function getListings(page = 1): Promise<PaginatedResponse<VendorListing>> {
  const response = await api.get('/api/vendor/listings', { params: { page } });
  return response.data;
}

export async function getListing(id: number): Promise<VendorListing> {
  const response = await api.get(`/api/vendor/listings/${id}`);
  return response.data.data;
}

export async function createListing(data: FormData): Promise<VendorListing> {
  const response = await api.post('/api/vendor/listings', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function updateListing(id: number, data: FormData): Promise<VendorListing> {
  const response = await api.post(`/api/vendor/listings/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: { _method: 'PUT' },
  });
  return response.data.data;
}

export async function deleteListing(id: number): Promise<void> {
  await api.delete(`/api/vendor/listings/${id}`);
}

export async function getListingSlots(
  id: number,
  dateFrom?: string,
  dateTo?: string
): Promise<{ activity: VendorListing; dates: Array<{ date: string; slots: VendorTimeSlot[] }> }> {
  const response = await api.get(`/api/vendor/listings/${id}/slots`, {
    params: { date_from: dateFrom, date_to: dateTo },
  });
  return response.data.data;
}

export async function createSlot(
  listingId: number,
  data: Omit<VendorTimeSlot, 'id' | 'booked_count' | 'remaining'>
): Promise<VendorTimeSlot> {
  const response = await api.post(`/api/vendor/listings/${listingId}/slots`, data);
  return response.data.data;
}

export async function updateSlot(
  listingId: number,
  slotId: number,
  data: Partial<Omit<VendorTimeSlot, 'id' | 'booked_count' | 'remaining'>>
): Promise<VendorTimeSlot> {
  const response = await api.put(`/api/vendor/listings/${listingId}/slots/${slotId}`, data);
  return response.data.data;
}

export async function deleteSlot(listingId: number, slotId: number): Promise<void> {
  await api.delete(`/api/vendor/listings/${listingId}/slots/${slotId}`);
}

export async function bulkCreateSlots(
  listingId: number,
  data: {
    date_from: string;
    date_to: string;
    start_time: string;
    capacity: number;
    days: number[];
    price_override?: number;
  }
): Promise<{ message: string; created_count: number }> {
  const response = await api.post(`/api/vendor/listings/${listingId}/slots/bulk`, data);
  return response.data;
}

export async function getBookings(status?: string, page = 1): Promise<PaginatedResponse<VendorBooking>> {
  const response = await api.get('/api/vendor/bookings', { params: { status, page } });
  return response.data;
}

export async function getBooking(id: number): Promise<VendorBooking> {
  const response = await api.get(`/api/vendor/bookings/${id}`);
  return response.data.data;
}

export async function updateBookingStatus(
  id: number,
  status: 'confirmed' | 'cancelled',
  note?: string
): Promise<VendorBooking> {
  const response = await api.post(`/api/vendor/bookings/${id}/status`, { status, note });
  return response.data.data;
}

export async function getEarnings(): Promise<VendorEarningSummary> {
  const response = await api.get('/api/vendor/earnings');
  return response.data.data;
}

export async function getPayouts(): Promise<VendorPayout[]> {
  const response = await api.get('/api/vendor/payouts');
  return response.data.data;
}

export async function getSettings(): Promise<VendorSettings> {
  const response = await api.get('/api/vendor/settings');
  return response.data.data;
}

export async function updateSettings(data: {
  business_name: string;
  bio?: string;
  service_area?: string;
}): Promise<VendorSettings> {
  const response = await api.put('/api/vendor/settings', data);
  return response.data.data;
}

export async function updatePayoutAccount(data: {
  method: string;
  account_name: string;
  account_number: string;
}): Promise<VendorSettings['payout_account']> {
  const response = await api.put('/api/vendor/settings/payout', data);
  return response.data.data;
}
