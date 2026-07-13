import { apiFetch, apiFetchMultipart } from '@/lib/api';

export interface ReviewEligibilityResponse {
  can_review: boolean;
  reason: string | null;
  activity: {
    id: number;
    title: string;
    slug: string;
  } | null;
  existing_review: {
    id: number;
    rating: number;
    comment: string | null;
    created_at: string;
  } | null;
}

export interface ReviewImage {
  id: number;
  url: string;
  sort_order: number;
}

export interface ReviewResponse {
  id: number;
  rating: number;
  comment: string | null;
  images: ReviewImage[];
  created_at: string | null;
}

export interface PublicReview {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
  images: ReviewImage[];
}

export interface PublicReviewsResponse {
  data: PublicReview[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export async function fetchReviewEligibility(
  bookingId: number
): Promise<ReviewEligibilityResponse> {
  const response = await apiFetch(`/bookings/${bookingId}/reviews/eligibility`);
  return (response as { data: ReviewEligibilityResponse }).data;
}

export interface ImageAsset {
  uri: string;
  type?: string;
  name?: string;
}

export async function submitReview(
  bookingId: number,
  payload: {
    rating: number;
    comment?: string;
    images?: ImageAsset[];
  }
): Promise<ReviewResponse> {
  const formData = new FormData();
  formData.append('rating', String(payload.rating));

  if (payload.comment) {
    formData.append('comment', payload.comment);
  }

  payload.images?.forEach((image) => {
    formData.append('images[]', {
      uri: image.uri,
      type: image.type ?? 'image/jpeg',
      name: image.name ?? `photo-${Date.now()}.jpg`,
    } as unknown as Blob);
  });

  const response = await apiFetchMultipart(`/bookings/${bookingId}/reviews`, {
    method: 'POST',
    body: formData,
  });

  return (response as { data: ReviewResponse }).data;
}

export async function fetchPublicReviews(
  slug: string,
  page = 1
): Promise<PublicReviewsResponse> {
  const response = await apiFetch(
    `/public/activities/${encodeURIComponent(slug)}/reviews?page=${page}`
  );
  return response as PublicReviewsResponse;
}
