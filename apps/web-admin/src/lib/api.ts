import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000',
  headers: {
    Accept: 'application/json',
  },
  // Token-based Sanctum auth; credentials disabled to avoid CSRF cookie issues.
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sanctum-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export interface AdminDashboardStats {
  total_users: number;
  total_customers: number;
  total_providers: number;
  total_admins: number;
  pending_providers: number;
  approved_providers: number;
  rejected_providers: number;
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_revenue_gross: number;
  total_commission: number;
  total_net: number;
  pending_provider_applications: Array<{
    id: number;
    business_name: string;
    verification_status: string;
    onboarding_status: string;
    user: { id: number; name: string; email: string } | null;
    created_at: string;
  }>;
  recent_bookings: Array<{
    id: number;
    booking_ref: string;
    status: string;
    traveler_count: number;
    total_price: number | string;
    currency: string;
    created_at: string;
    activity: { id: number; title: string; slug: string } | null;
    customer: { id: number; name: string } | null;
  }>;
  monthly_revenue: Array<{
    month: string;
    gross: number;
    commission: number;
    net: number;
    bookings: number;
  }>;
}

export interface AdminProvider {
  id: number;
  business_name: string;
  verification_status: string;
  onboarding_status: string;
  is_featured: boolean;
  avg_rating: number;
  total_bookings: number;
  commission_rate: number;
  user: { id: number; name: string; email: string } | null;
  created_at: string;
  approved_at: string | null;
}

export interface AdminProviderDetail extends AdminProvider {
  bio: string | null;
  service_area: string | null;
  activities_count: number;
  payout_accounts: Array<{
    id: number;
    method: string;
    account_name: string;
    account_number: string;
    is_default: boolean;
  }>;
}

export interface AdminListing {
  id: number;
  title: string;
  slug: string;
  duration_minutes: number;
  max_group: number;
  base_price_usd: number | string;
  status: string;
  is_featured: boolean;
  is_instant_book: boolean;
  category: { id: number; name: string; slug: string } | null;
  city: { id: number; name: string; slug: string } | null;
  provider: { id: number; business_name: string; verification_status: string } | null;
  hero_image: string | null;
  created_at: string;
}

export interface AdminListingDetail extends AdminListing {
  description: string | null;
  itinerary: any | null;
  inclusions: string[] | null;
  exclusions: string[] | null;
  meeting_point: {
    address: string | null;
    lat: number | null;
    lng: number | null;
  };
  min_group: number;
  spoken_languages: string[] | null;
  published_at: string | null;
  gallery: Array<{ id: number; url: string; is_hero: boolean }>;
}

export interface AdminBooking {
  id: number;
  booking_ref: string;
  status: string;
  booking_date: string | null;
  booking_time: string | null;
  traveler_count: number;
  total_price: number | string;
  commission_amount: number | string;
  currency: string;
  payment_method: string | null;
  created_at: string;
  activity: { id: number; title: string; slug: string } | null;
  provider: { id: number; business_name: string } | null;
  customer: { id?: number; name: string | null; email?: string | null } | null;
}

export interface AdminBookingDetail extends AdminBooking {
  special_requests: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  time_slot: { id: number; date: string; start_time: string } | null;
  customer: { id?: number; name: string | null; email?: string | null; phone?: string | null } | null;
  addons: Array<{ id: number; name: string; price: number | string }>;
  status_history: Array<{
    status: string;
    changed_by_type: string;
    note: string | null;
    created_at: string;
  }>;
}

export interface AdminPayout {
  id: number;
  provider_id: number;
  period_start: string;
  period_end: string;
  gross_amount: number | string;
  commission: number | string;
  net_amount: number | string;
  status: string;
  payout_method: string | null;
  transaction_ref: string | null;
  paid_at: string | null;
  created_at: string;
  provider: { id: number; business_name: string } | null;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: { id: number; name: string; label: string } | null;
  email_verified_at: string | null;
  created_at: string;
}

export interface AdminUserDetail extends AdminUser {
  phone: string | null;
  avatar_url: string | null;
  language_pref: string | null;
  date_of_birth: string | null;
  country: string | null;
  nationality: string | null;
  address: string | null;
  bio: string | null;
  recent_bookings: Array<{
    id: number;
    booking_ref: string;
    status: string;
    total_price: number | string;
    currency: string;
    activity: { id: number; title: string; slug: string } | null;
    created_at: string;
  }>;
}

export async function getDashboardStats(): Promise<AdminDashboardStats> {
  const response = await api.get('/api/admin/dashboard');
  return response.data.data;
}

export async function getProvider(id: number): Promise<AdminProviderDetail> {
  const response = await api.get(`/api/admin/providers/${id}`);
  return response.data.data;
}

export async function getProviders(status?: string, query?: string, page = 1): Promise<PaginatedResponse<AdminProvider>> {
  const response = await api.get('/api/admin/providers', {
    params: { status, query, page, per_page: 20 },
  });
  return response.data;
}

export async function approveProvider(id: number): Promise<AdminProvider> {
  const response = await api.post(`/api/admin/providers/${id}/approve`);
  return response.data.data;
}

export async function rejectProvider(id: number, reason?: string): Promise<AdminProvider> {
  const response = await api.post(`/api/admin/providers/${id}/reject`, { reason });
  return response.data.data;
}

export async function toggleFeaturedProvider(id: number): Promise<AdminProvider> {
  const response = await api.post(`/api/admin/providers/${id}/toggle-featured`);
  return response.data.data;
}

export async function getListing(id: number): Promise<AdminListingDetail> {
  const response = await api.get(`/api/admin/listings/${id}`);
  return response.data.data;
}

export async function getListings(status?: string, providerId?: number, query?: string, page = 1): Promise<PaginatedResponse<AdminListing>> {
  const response = await api.get('/api/admin/listings', {
    params: { status, provider_id: providerId, query, page, per_page: 20 },
  });
  return response.data;
}

export async function updateListingStatus(id: number, status: string): Promise<AdminListing> {
  const response = await api.post(`/api/admin/listings/${id}/status`, { status });
  return response.data.data;
}

export async function toggleFeaturedListing(id: number): Promise<AdminListing> {
  const response = await api.post(`/api/admin/listings/${id}/toggle-featured`);
  return response.data.data;
}

export async function deleteListing(id: number): Promise<void> {
  await api.delete(`/api/admin/listings/${id}`);
}

export async function getBooking(id: number): Promise<AdminBookingDetail> {
  const response = await api.get(`/api/admin/bookings/${id}`);
  return response.data.data;
}

export async function getBookings(status?: string, query?: string, page = 1): Promise<PaginatedResponse<AdminBooking>> {
  const response = await api.get('/api/admin/bookings', {
    params: { status, query, page, per_page: 20 },
  });
  return response.data;
}

export async function updateBookingStatus(id: number, status: 'confirmed' | 'completed' | 'cancelled', note?: string): Promise<AdminBooking> {
  const response = await api.post(`/api/admin/bookings/${id}/status`, { status, note });
  return response.data.data;
}

export async function getPayouts(status?: string, providerId?: number, page = 1): Promise<PaginatedResponse<AdminPayout>> {
  const response = await api.get('/api/admin/payouts', {
    params: { status, provider_id: providerId, page, per_page: 20 },
  });
  return response.data;
}

export async function createPayout(data: {
  provider_id: number;
  period_start: string;
  period_end: string;
  payout_method?: string;
}): Promise<AdminPayout> {
  const response = await api.post('/api/admin/payouts', data);
  return response.data.data;
}

export async function markPayoutPaid(id: number, transactionRef?: string): Promise<AdminPayout> {
  const response = await api.post(`/api/admin/payouts/${id}/mark-paid`, { transaction_ref: transactionRef });
  return response.data.data;
}

export async function getUser(id: number): Promise<AdminUserDetail> {
  const response = await api.get(`/api/admin/users/${id}`);
  return response.data.data;
}

export async function getUsers(role?: string, query?: string, page = 1): Promise<PaginatedResponse<AdminUser>> {
  const response = await api.get('/api/admin/users', {
    params: { role, query, page, per_page: 20 },
  });
  return response.data;
}

export async function updateUserRole(id: number, role: string): Promise<AdminUser> {
  const response = await api.patch(`/api/admin/users/${id}/role`, { role });
  return response.data.data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/api/admin/users/${id}`);
}

export interface CreateUserData {
  name: string;
  email: string;
  phone?: string;
  role: string;
  password: string;
  password_confirmation: string;
}

export async function createUser(data: CreateUserData): Promise<AdminUser> {
  const response = await api.post('/api/admin/users', data);
  return response.data.data;
}
