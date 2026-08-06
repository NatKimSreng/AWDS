import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Linking,
  Share,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchActivity } from '@/lib/publicApi';
import { formatPrice } from '@/lib/formatCurrency';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { fetchFavoriteStatus, toggleFavorite } from '@/lib/favoriteApi';
import { fetchPublicReviews, PublicReview, ReviewImage } from '@/lib/reviewApi';
import { saveImageToGallery } from '@/lib/saveImage';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { SectionHeader } from '@/components/SectionHeader';

function splitList(value: unknown): string[] {
  if (typeof value !== 'string' || !value) return [];
  return value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function staticMapUrl(lat: number, lng: number, w = 380, h = 200): string {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=${w}x${h}&maptype=mapnik&markers=${lat},${lng},red-pushpin`;
}

function openInMaps(lat: number, lng: number) {
  Linking.openURL(
    `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`
  ).catch(() => {});
}

export default function ActivityDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const currency = useSettingsStore((state) => state.currency);
  const queryClient = useQueryClient();

  const userId = useAuthStore((state) => state.user?.id);

  const {
    data: activity,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['activity', slug],
    queryFn: () => fetchActivity(slug),
    enabled: !!slug,
  });

  const activityId = activity ? (activity.id as number) : null;

  const { data: favoriteStatus } = useQuery({
    queryKey: ['favorite-status', activityId],
    queryFn: () => fetchFavoriteStatus(activityId as number),
    enabled: !!userId && !!activityId,
  });

  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(null);
  const isFavorite = optimisticFavorite ?? favoriteStatus?.is_favorite ?? false;

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavorite(activityId as number),
    onMutate: async () => {
      setOptimisticFavorite(!isFavorite);
    },
    onError: () => {
      setOptimisticFavorite((prev) => (prev === null ? null : !prev));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-status', activityId] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      setOptimisticFavorite(null);
    },
  });

  const insets = useSafeAreaInsets();

  const { data: reviewsResponse } = useQuery({
    queryKey: ['activity-reviews', slug],
    queryFn: () => fetchPublicReviews(slug),
    enabled: !!slug,
  });

  const reviews = reviewsResponse?.data ?? [];
  const gallery = (activity?.gallery as string[] | undefined) ?? [];

  const description = (activity?.description as string | undefined) ?? '';
  const highlights =
    (activity?.highlights as string[] | undefined) ??
    (description
      ? (description.match(/[^.!?]+[.!?]+/g) ?? []).slice(0, 3).map((s) => s.trim())
      : []);
  const inclusions = splitList(activity?.inclusions);
  const exclusions = splitList(activity?.exclusions);
  const meetingPoint = activity?.meeting_point as
    | { address?: string; lat?: number; lng?: number }
    | null;
  const hasCoords = !!meetingPoint?.lat && !!meetingPoint?.lng;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg justify-center items-center">
        <ActivityIndicator color="#000C3B" />
        <Text className="font-body text-gyg-muted mt-3">Loading experience…</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        className="flex-1 bg-gyg-bg justify-center items-center px-6"
      >
        <ErrorState
          title="Couldn’t load activity"
          error={error}
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  if (!activity) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg justify-center items-center px-6">
        <EmptyState
          icon="frown-o"
          title="Tour not found"
          subtitle="We couldn't find that experience."
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const durationHours = Math.round((activity.duration_minutes as number) / 60);
  const languages = ((activity.spoken_languages as string[]) ?? []).join(', ').toUpperCase();
  const avgRating = (activity.avg_rating as number) || 0;
  const reviewsCount = (activity.reviews_count as number) || 0;

  const handleShare = () => {
    Share.share({
      title: activity.title as string,
      message: `Check out ${activity.title as string} on AngkorWatDayTour`,
    }).catch(() => {});
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-gyg-bg">
      <StatusBar barStyle="light-content" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="relative h-80">
          <ImageWithFallback
            uri={activity.hero_image as string | undefined}
            containerClassName="h-80 w-full"
            className="h-80 w-full"
            onLongPress={() => saveImageToGallery(activity.hero_image as string | undefined)}
          />
          <View className="absolute inset-0 bg-gradient-to-b from-gyg-navy/70 via-transparent to-gyg-bg" />

          <View className="absolute top-4 left-4 right-4 flex-row justify-between z-10">
            <Pressable
              onPress={() => router.back()}
              className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-full items-center justify-center active:bg-white/30"
            >
              <FontAwesome name="arrow-left" size={18} color="#fff" />
            </Pressable>

            <View className="flex-row gap-2.5">
              <Pressable
                onPress={handleShare}
                className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-full items-center justify-center active:bg-white/30"
              >
                <FontAwesome name="share-alt" size={16} color="#fff" />
              </Pressable>

              {userId && (
                <Pressable
                  onPress={() => favoriteMutation.mutate()}
                  disabled={favoriteMutation.isPending}
                  className={`w-11 h-11 rounded-full items-center justify-center active:opacity-90 ${
                    isFavorite ? 'bg-gyg-navy' : 'bg-white/20 backdrop-blur-md'
                  }`}
                >
                  <FontAwesome
                    name={isFavorite ? 'heart' : 'heart-o'}
                    size={18}
                    color={isFavorite ? '#fff' : '#fff'}
                  />
                </Pressable>
              )}
            </View>
          </View>

          {gallery.length > 0 && (
            <View className="absolute bottom-4 right-4 bg-gyg-navy/80 px-3 py-1.5 rounded-full">
              <Text className="font-body text-xs text-white">
                {gallery.length + 1} photo{gallery.length + 1 === 1 ? '' : 's'}
              </Text>
            </View>
          )}
        </View>

        {/* Gallery thumbnails */}
        {gallery.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4 px-5"
          >
            {gallery.map((url, index) => (
              <ImageWithFallback
                key={index}
                uri={url}
                containerClassName="w-24 h-24 rounded-xl mr-3 bg-gyg-light border border-gyg-border"
                className="w-24 h-24 rounded-xl"
                onLongPress={() => saveImageToGallery(url)}
              />
            ))}
          </ScrollView>
        )}

        <View className="p-5 pb-32">
          {/* Title card */}
          <View className="bg-white rounded-2xl p-5 shadow-card mb-4">
            <View className="flex-row flex-wrap items-center gap-2 mb-3">
              {(activity.is_instant_book as boolean) && (
                <View className="bg-gyg-blue/10 rounded-full px-3 py-1">
                  <Text className="font-body text-xs text-gyg-blue font-semibold">Instant Book</Text>
                </View>
              )}
              {(activity.free_cancellation as boolean) && (
                <View className="bg-emerald-50 rounded-full px-3 py-1 border border-emerald-100">
                  <Text className="font-body text-xs text-emerald-600 font-semibold">Free cancellation</Text>
                </View>
              )}
              {(activity.cancellation_policy as string) && (
                <View className="bg-gyg-light rounded-full px-3 py-1">
                  <Text className="font-body text-xs text-gyg-muted">
                    {activity.cancellation_policy as string}
                  </Text>
                </View>
              )}
            </View>

            <Text className="font-heading text-2xl text-gyg-text leading-8 mb-3">
              {activity.title as string}
            </Text>

            <View className="flex-row items-center gap-1 mb-4">
              <FontAwesome name="map-marker" size={16} color="#6B7280" />
              <Text className="font-body text-base text-gyg-muted flex-1">
                {(activity.city as { name: string } | null)?.name ?? 'Siem Reap'}, Cambodia
              </Text>
            </View>

            <Pressable
              onPress={() =>
                router.push(`/activity-reviews/${activity.slug as string}` as never)
              }
              className="flex-row items-center gap-3 bg-gyg-bg rounded-xl p-3 active:opacity-80"
            >
              <View className="w-11 h-11 rounded-lg bg-gyg-navy items-center justify-center">
                <Text className="font-heading text-white text-base">
                  {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                </Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-1 mb-0.5">
                  <FontAwesome name="star" size={14} color="#F59E0B" />
                  <Text className="font-body text-sm text-gyg-text font-semibold">
                    {avgRating > 0 ? `${avgRating.toFixed(1)}` : 'No reviews yet'}
                  </Text>
                  <Text className="font-body text-sm text-gyg-muted">
                    {reviewsCount > 0 ? `(${reviewsCount} reviews)` : ''}
                  </Text>
                </View>
                <Text className="font-body text-sm text-gyg-blue font-medium">
                  See all reviews →
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Quick facts */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-white rounded-2xl p-3 shadow-card items-center border border-gyg-border">
              <View className="w-9 h-9 rounded-full bg-gyg-blue/10 items-center justify-center mb-2">
                <FontAwesome name="clock-o" size={18} color="#0071EB" />
              </View>
              <Text className="font-body text-gyg-text font-semibold text-sm">
                {durationHours > 0 ? `${durationHours}h` : 'Flexible'}
              </Text>
              <Text className="font-body text-gyg-muted text-xs">Duration</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-3 shadow-card items-center border border-gyg-border">
              <View className="w-9 h-9 rounded-full bg-gyg-blue/10 items-center justify-center mb-2">
                <FontAwesome name="users" size={16} color="#0071EB" />
              </View>
              <Text className="font-body text-gyg-text font-semibold text-sm">
                {activity.min_group as number}-{activity.max_group as number}
              </Text>
              <Text className="font-body text-gyg-muted text-xs">Guests</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-3 shadow-card items-center border border-gyg-border">
              <View className="w-9 h-9 rounded-full bg-gyg-blue/10 items-center justify-center mb-2">
                <FontAwesome name="language" size={16} color="#0071EB" />
              </View>
              <Text className="font-body text-gyg-text font-semibold text-sm" numberOfLines={1}>
                {languages || 'EN'}
              </Text>
              <Text className="font-body text-gyg-muted text-xs">Language</Text>
            </View>
          </View>

          {/* About */}
          <View className="bg-white rounded-2xl p-5 shadow-card mb-4 border border-gyg-border">
            <Text className="font-heading text-lg text-gyg-text mb-3">About this experience</Text>
            <Text className="font-body text-gyg-muted leading-6">
              {activity.description as string}
            </Text>
          </View>

          {/* Highlights */}
          {highlights.length > 0 && (
            <View className="bg-white rounded-2xl p-5 shadow-card mb-4 border border-gyg-border">
              <Text className="font-heading text-lg text-gyg-text mb-3">Highlights</Text>
              {highlights.map((item: string, idx: number) => (
                <View key={idx} className="flex-row items-start mb-3 last:mb-0">
                  <View className="w-5 h-5 rounded-full bg-gyg-blue/10 items-center justify-center mt-0.5 mr-3">
                    <FontAwesome name="check" size={11} color="#0071EB" />
                  </View>
                  <Text className="font-body text-gyg-text flex-1 leading-5">{item}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Itinerary */}
          {Array.isArray(activity.itinerary) &&
            (activity.itinerary as Array<{ time: string; description: string }>).length > 0 && (
              <View className="bg-white rounded-2xl p-5 shadow-card mb-4 border border-gyg-border">
                <Text className="font-heading text-lg text-gyg-text mb-3">Itinerary</Text>
                {(activity.itinerary as Array<{ time: string; description: string }>).map(
                  (item, index) => (
                    <View key={index} className="flex-row mb-3 last:mb-0">
                      <Text className="font-body text-gyg-navy font-bold w-16">{item.time}</Text>
                      <Text className="font-body text-gyg-muted flex-1 leading-5">
                        {item.description}
                      </Text>
                    </View>
                  )
                )}
              </View>
            )}

          {/* Included / not included */}
          {(inclusions.length > 0 || exclusions.length > 0) && (
            <View className="bg-white rounded-2xl p-5 shadow-card mb-4 border border-gyg-border">
              <Text className="font-heading text-lg text-gyg-text mb-3">What’s included</Text>
              {inclusions.length > 0 && (
                <View className="mb-4">
                  <Text className="font-body text-sm text-gyg-text font-semibold mb-2">Included</Text>
                  {inclusions.map((item: string, idx: number) => (
                    <View key={`in-${idx}`} className="flex-row items-start mb-2 last:mb-0">
                      <FontAwesome name="check" size={13} color="#000C3B" />
                      <Text className="font-body text-gyg-text flex-1 ml-3 leading-5">{item}</Text>
                    </View>
                  ))}
                </View>
              )}
              {exclusions.length > 0 && (
                <View>
                  <Text className="font-body text-sm text-gyg-text font-semibold mb-2">Not included</Text>
                  {exclusions.map((item: string, idx: number) => (
                    <View key={`ex-${idx}`} className="flex-row items-start mb-2 last:mb-0">
                      <FontAwesome name="times" size={13} color="#6B7280" />
                      <Text className="font-body text-gyg-muted flex-1 ml-3 leading-5">{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Meeting point */}
          <View className="bg-white rounded-2xl p-5 shadow-card mb-4 border border-gyg-border">
            <Text className="font-heading text-lg text-gyg-text mb-3">Meeting point</Text>
            <View className="flex-row items-start mb-3">
              <FontAwesome name="map-marker" size={18} color="#0071EB" />
              <Text className="font-body text-gyg-text flex-1 ml-3 leading-5">
                {meetingPoint?.address ?? 'Not specified'}
              </Text>
            </View>
            {hasCoords ? (
              <Pressable
                onPress={() => openInMaps(meetingPoint!.lat!, meetingPoint!.lng!)}
                className="active:opacity-80"
              >
                <ImageWithFallback
                  uri={staticMapUrl(meetingPoint!.lat!, meetingPoint!.lng!)}
                  containerClassName="h-48 w-full rounded-xl"
                  className="h-48 w-full rounded-xl"
                  resizeMode="cover"
                />
                <View className="flex-row items-center justify-center mt-2">
                  <Text className="font-body text-gyg-navy text-sm font-semibold mr-1">
                    Open in Maps
                  </Text>
                  <FontAwesome name="external-link" size={12} color="#000C3B" />
                </View>
              </Pressable>
            ) : (
              <Text className="font-body text-gyg-muted text-sm">
                Exact location will be confirmed after booking.
              </Text>
            )}
          </View>

          {/* Provider */}
          <Pressable
            onPress={() =>
              router.push(`/provider/${(activity.provider as { id: number } | null)?.id}` as never)
            }
            className="bg-white rounded-2xl p-4 shadow-card mb-4 flex-row items-center active:bg-gyg-bg border border-gyg-border"
          >
            <View className="w-14 h-14 rounded-full bg-gyg-navy items-center justify-center mr-4 border-2 border-gyg-blue/20">
              <FontAwesome name="user" size={22} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="font-heading text-base text-gyg-text">
                {(activity.provider as { business_name: string } | null)?.business_name ?? 'Local provider'}
              </Text>
              <View className="flex-row items-center mt-0.5">
                <FontAwesome name="star" size={12} color="#000C3B" />
                <Text className="font-body text-gyg-muted text-sm ml-1">
                  {(activity.provider as { avg_rating: number } | null)?.avg_rating ?? 0} ·{' '}
                  {(activity.provider as { total_bookings: number } | null)?.total_bookings ?? 0} bookings
                </Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#6B7280" />
          </Pressable>

          {/* Reviews */}
          <View className="bg-white rounded-2xl p-5 shadow-card mb-4 border border-gyg-border">
            <SectionHeader
              title="Reviews"
              subtitle={
                avgRating > 0
                  ? `${avgRating.toFixed(1)} · ${reviewsCount} ${reviewsCount === 1 ? 'review' : 'reviews'}`
                  : 'No reviews yet'
              }
              actionLabel={reviews.length > 0 ? 'See all' : undefined}
              onPress={
                reviews.length > 0
                  ? () => router.push(`/activity-reviews/${activity.slug as string}` as never)
                  : undefined
              }
            />

            {reviews.length === 0 ? (
              <Text className="font-body text-gyg-muted">Be the first to leave a review after your trip.</Text>
            ) : (
              reviews.slice(0, 3).map((review: PublicReview, index: number) => (
                <View
                  key={review.id}
                  className={`${index !== 0 ? 'border-t border-gyg-border pt-4 mt-4' : ''}`}
                >
                  <View className="flex-row items-center mb-2">
                    <View className="w-9 h-9 rounded-full bg-gyg-bg items-center justify-center mr-3">
                      <FontAwesome name="user" size={14} color="#000C3B" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-body text-sm text-gyg-text font-semibold">
                        {review.user.name}
                      </Text>
                      <Text className="font-body text-xs text-gyg-muted">
                        {new Date(review.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className="flex-row items-center bg-gyg-navy rounded-md px-2 py-1">
                      <FontAwesome name="star" size={10} color="#fff" />
                      <Text className="font-body text-xs text-white font-semibold ml-1">
                        {review.rating}
                      </Text>
                    </View>
                  </View>
                  {review.comment && (
                    <Text className="font-body text-gyg-text leading-5">{review.comment}</Text>
                  )}
                  {review.images?.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
                      {review.images.map((image: ReviewImage, idx: number) => (
                        <ImageWithFallback
                          key={idx}
                          uri={image.url}
                          containerClassName="w-16 h-16 rounded-lg mr-2 bg-gyg-light"
                          className="w-16 h-16 rounded-lg"
                        />
                      ))}
                    </ScrollView>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gyg-border px-5 pt-3 flex-row items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <View>
          <Text className="font-body text-gyg-muted text-xs">From</Text>
          <Text className="font-heading text-2xl text-gyg-navy">
            {formatPrice(activity.base_price_usd as string, currency)}
          </Text>
          <Text className="font-body text-gyg-muted text-xs">per person</Text>
        </View>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/booking/date-time',
              params: {
                slug: activity.slug as string,
                title: activity.title as string,
                basePrice: String(activity.base_price_usd),
                duration: String(activity.duration_minutes),
                maxGroup: String(activity.max_group),
                heroImage: (activity.hero_image as string | undefined) ?? '',
              } as never,
            })
          }
          className="bg-gyg-navy rounded-2xl px-7 py-4 active:opacity-90 shadow-lg shadow-gyg-navy/25"
        >
          <Text className="font-body text-white font-semibold text-base">Check availability</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
