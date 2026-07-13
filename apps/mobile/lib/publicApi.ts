import { apiFetch } from '@/lib/api';

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  children?: Category[];
  activities_count?: number;
}

export interface City {
  id: number;
  name: string;
  slug: string;
  activities_count?: number;
}

export interface ProviderSummary {
  id: number;
  business_name: string;
  avg_rating: string;
}

export interface ProviderActivity {
  id: number;
  title: string;
  slug: string;
  duration_minutes: number;
  base_price_usd: string;
  avg_rating: number;
  reviews_count: number;
  hero_image: string | null;
}

export interface ProviderDetail {
  id: number;
  business_name: string;
  bio: string | null;
  service_area: string | null;
  avg_rating: number;
  total_bookings: number;
  activities_count: number;
  activities: ProviderActivity[];
}

export interface ActivityCard {
  id: number;
  title: string;
  slug: string;
  duration_minutes: number;
  min_group: number;
  max_group: number;
  base_price_usd: string;
  is_featured: boolean;
  is_instant_book: boolean;
  avg_rating: number;
  reviews_count: number;
  category: Category | null;
  city: City | null;
  provider: ProviderSummary | null;
  hero_image: string | null;
}

export interface PaginatedActivities {
  data: ActivityCard[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Filters {
  category?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
  duration?: number;
  group_size?: number;
  language?: string;
  featured?: boolean;
  instant_book?: boolean;
  query?: string;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'duration';
  page?: number;
  per_page?: number;
}

export async function fetchCategories(withCount = false): Promise<Category[]> {
  const response = await apiFetch(`/public/categories?with_count=${withCount ? 1 : 0}`);
  return (response as { data: Category[] }).data;
}

export async function fetchCities(withCount = false): Promise<City[]> {
  const response = await apiFetch(`/public/cities?with_count=${withCount ? 1 : 0}`);
  return (response as { data: City[] }).data;
}

export async function fetchActivities(filters: Filters = {}): Promise<PaginatedActivities> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const query = params.toString();
  const response = await apiFetch(`/public/activities${query ? `?${query}` : ''}`);
  return response as PaginatedActivities;
}

export async function fetchActivity(slug: string): Promise<Record<string, unknown>> {
  const response = await apiFetch(`/public/activities/${encodeURIComponent(slug)}`);
  return (response as { data: Record<string, unknown> }).data;
}

export async function fetchProvider(id: number | string): Promise<ProviderDetail> {
  const response = await apiFetch(`/public/providers/${id}`);
  return (response as { data: ProviderDetail }).data;
}
