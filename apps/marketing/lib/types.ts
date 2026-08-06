export interface Activity {
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
  meeting_point_lat: number | null;
  meeting_point_lng: number | null;
  service_types: { id: number; name: string; slug: string; icon: string | null; badge_color: string | null }[];
  transport_modes: { id: number; name: string; slug: string; icon: string | null; badge_color: string | null; category: string }[];
}

export interface ServiceType {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  badge_color: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface TransportMode {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  badge_color: string | null;
  category: string;
  is_active: boolean;
  sort_order: number;
}
