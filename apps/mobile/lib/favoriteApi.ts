import { apiFetch } from '@/lib/api';

export interface Favorite {
  id: number;
  activity_id: number;
  activity: {
    id: number;
    title: string;
    slug: string;
    base_price_usd: string;
    avg_rating: number;
    reviews_count: number;
    hero_image: string | null;
  };
}

export interface FavoritesResponse {
  data: Favorite[];
}

export async function fetchFavorites(): Promise<Favorite[]> {
  const response = await apiFetch('/favorites');
  return (response as FavoritesResponse).data;
}

export async function toggleFavorite(activityId: number): Promise<{
  message: string;
  is_favorite: boolean;
}> {
  const response = await apiFetch('/favorites', {
    method: 'POST',
    body: JSON.stringify({ activity_id: activityId }),
  });
  return response as { message: string; is_favorite: boolean };
}

export async function fetchFavoriteStatus(
  activityId: number
): Promise<{ is_favorite: boolean }> {
  const response = await apiFetch(`/activities/${activityId}/favorite`);
  return response as { is_favorite: boolean };
}
