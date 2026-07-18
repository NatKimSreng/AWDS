import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchActivity } from '@/lib/publicApi';
import { formatPrice } from '@/lib/formatCurrency';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { fetchFavoriteStatus, toggleFavorite } from '@/lib/favoriteApi';
import { fetchPublicReviews, PublicReview, ReviewImage } from '@/lib/reviewApi';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { EmptyState } from '@/components/EmptyState';

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

  const { data: activity, isLoading } = useQuery({
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
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center">
        <ActivityIndicator color="#C8530A" />
      </SafeAreaView>
    );
  }

  if (!activity) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center px-6">
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

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-sand-bg">
      <ScrollView className="flex-1">
        <View className="relative">
          <ImageWithFallback
            uri={activity.hero_image as string | undefined}
            containerClassName="h-64 w-full"
            className="h-64 w-full"
          />
          <View className="absolute inset-0 bg-black/10" />
          <Pressable
            onPress={() => router.back()}
            className="absolute top-4 left-4 w-11 h-11 bg-white/90 rounded-full items-center justify-center z-10 active:bg-white"
          >
            <FontAwesome name="arrow-left" size={18} color="#2B2622" />
          </Pressable>

          {userId && (
            <Pressable
              onPress={() => favoriteMutation.mutate()}
              disabled={favoriteMutation.isPending}
              className="absolute top-4 right-4 w-11 h-11 bg-white/90 rounded-full items-center justify-center z-10 active:bg-white"
            >
              <FontAwesome
                name={isFavorite ? 'heart' : 'heart-o'}
                size={20}
                color={isFavorite ? '#C8530A' : '#2B2622'}
              />
            </Pressable>
          )}
        </View>

        {gallery.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="bg-white py-3"
          >
            {gallery.map((url, index) => (
              <ImageWithFallback
                key={index}
                uri={url}
                containerClassName="w-24 h-24 rounded-xl mx-2"
                className="w-24 h-24 rounded-xl"
              />
            ))}
          </ScrollView>
        )}

        <View className="p-5 pb-28">
          <View className="flex-row flex-wrap items-center gap-2 mb-3">
            <Text className="font-body text-sm text-stone-gray">
              {(activity.category as { name: string } | null)?.name} ·{' '}
              {(activity.city as { name: string } | null)?.name}
            </Text>
            {(activity.is_instant_book as boolean) && (
              <View className="bg-success-green/10 rounded-full px-2.5 py-0.5">
                <Text className="font-body text-xs text-success-green font-semibold">Instant Book</Text>
              </View>
            )}
          </View>

          <Text className="font-heading text-2xl text-stone-charcoal mb-3">
            {activity.title as string}
          </Text>

          <View className="flex-row items-center flex-wrap gap-y-2 mb-4">
            <View className="flex-row items-center mr-4">
              <FontAwesome name="star" size={16} color="#D4AF37" />
              <Text className="font-body text-stone-charcoal ml-1">
                {activity.avg_rating as number} ({activity.reviews_count as number} reviews)
              </Text>
            </View>
            <View className="flex-row items-center mr-4">
              <FontAwesome name="clock-o" size={16} color="#6B635C" />
              <Text className="font-body text-stone-gray ml-1">{durationHours}h</Text>
            </View>
            <View className="flex-row items-center">
              <FontAwesome name="users" size={16} color="#6B635C" />
              <Text className="font-body text-stone-gray ml-1">
                {activity.min_group as number}-{activity.max_group as number}
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <Text className="font-heading text-lg text-stone-charcoal mb-2">About</Text>
            <Text className="font-body text-stone-gray leading-5">
              {activity.description as string}
            </Text>
          </View>

          {Array.isArray(activity.itinerary) && (activity.itinerary as Array<{ time: string; description: string }>).length > 0 && (
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="font-heading text-lg text-stone-charcoal mb-3">Itinerary</Text>
              {(activity.itinerary as Array<{ time: string; description: string }>).map((item, index) => (
                <View key={index} className="flex-row mb-3">
                  <Text className="font-body text-angkor-orange font-semibold w-16">{item.time}</Text>
                  <Text className="font-body text-stone-gray flex-1">{item.description}</Text>
                </View>
              ))}
            </View>
          )}

          {highlights.length > 0 && (
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="font-heading text-lg text-stone-charcoal mb-3">Highlights</Text>
              {highlights.map((item: string, idx: number) => (
                <View key={idx} className="flex-row mb-2.5 last:mb-0">
                  <FontAwesome name="check-circle" size={16} color="#C8530A" />
                  <Text className="font-body text-stone-charcoal flex-1 ml-2 leading-5">
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {(inclusions.length > 0 || exclusions.length > 0) && (
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="font-heading text-lg text-stone-charcoal mb-3">
                What's included
              </Text>
              {inclusions.length > 0 && (
                <View className="mb-3">
                  <Text className="font-body text-sm text-stone-gray mb-2">Included</Text>
                  {inclusions.map((item: string, idx: number) => (
                    <View key={`in-${idx}`} className="flex-row mb-2 last:mb-0">
                      <FontAwesome name="check" size={14} color="#2F7D4F" />
                      <Text className="font-body text-stone-charcoal flex-1 ml-2 leading-5">
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              {exclusions.length > 0 && (
                <View>
                  <Text className="font-body text-sm text-stone-gray mb-2">Not included</Text>
                  {exclusions.map((item: string, idx: number) => (
                    <View key={`ex-${idx}`} className="flex-row mb-2 last:mb-0">
                      <FontAwesome name="times" size={14} color="#B3261E" />
                      <Text className="font-body text-stone-charcoal flex-1 ml-2 leading-5">
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <Text className="font-heading text-lg text-stone-charcoal mb-2">Meeting Point</Text>
            <Text className="font-body text-stone-gray mb-3">
              {meetingPoint?.address ?? 'Not specified'}
            </Text>
            {hasCoords ? (
              <Pressable onPress={() => openInMaps(meetingPoint!.lat!, meetingPoint!.lng!)}>
                <ImageWithFallback
                  uri={staticMapUrl(meetingPoint!.lat!, meetingPoint!.lng!)}
                  containerClassName="h-48 w-full rounded-xl"
                  className="h-48 w-full rounded-xl"
                  resizeMode="cover"
                />
                <Text className="font-body text-angkor-orange text-sm mt-2 text-center font-semibold">
                  Open in Maps →
                </Text>
              </Pressable>
            ) : (
              <Text className="font-body text-stone-gray text-sm">
                Exact location will be confirmed after booking.
              </Text>
            )}
          </View>

          {languages && (
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="font-heading text-lg text-stone-charcoal mb-1">Languages</Text>
              <Text className="font-body text-stone-gray">{languages}</Text>
            </View>
          )}

          <Pressable
            onPress={() => router.push(`/provider/${(activity.provider as { id: number } | null)?.id}` as never)}
            className="bg-white rounded-2xl p-4 shadow-sm mb-4 flex-row items-center active:bg-stone-gray/5"
          >
            <View className="w-12 h-12 rounded-full bg-angkor-orange/10 items-center justify-center mr-4">
              <FontAwesome name="user" size={20} color="#C8530A" />
            </View>
            <View className="flex-1">
              <Text className="font-heading text-base text-stone-charcoal">
                {(activity.provider as { business_name: string } | null)?.business_name ?? 'Local provider'}
              </Text>
              <View className="flex-row items-center mt-0.5">
                <FontAwesome name="star" size={12} color="#D4AF37" />
                <Text className="font-body text-stone-gray text-sm ml-1">
                  {(activity.provider as { avg_rating: number } | null)?.avg_rating ?? 0} ·{' '}
                  {(activity.provider as { total_bookings: number } | null)?.total_bookings ?? 0} bookings
                </Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
          </Pressable>

          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="font-heading text-lg text-stone-charcoal">Reviews</Text>
              <Text className="font-body text-stone-gray">
                {reviews.length} review{reviews.length === 1 ? '' : 's'}
              </Text>
            </View>

            {reviews.length === 0 ? (
              <Text className="font-body text-stone-gray">No reviews yet.</Text>
            ) : (
              reviews.slice(0, 3).map((review: PublicReview) => (
                <View key={review.id} className="mb-4 last:mb-0">
                  <View className="flex-row items-center mb-1">
                    <FontAwesome name="star" size={12} color="#D4AF37" />
                    <Text className="font-body text-stone-charcoal ml-1 mr-2">{review.rating}</Text>
                    <Text className="font-body text-stone-gray text-sm">{review.user.name}</Text>
                  </View>
                  {review.comment && (
                    <Text className="font-body text-stone-charcoal leading-5">
                      {review.comment}
                    </Text>
                  )}
                  {review.images?.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                      {review.images.map((image: ReviewImage, idx: number) => (
                        <ImageWithFallback
                          key={idx}
                          uri={image.url}
                          containerClassName="w-16 h-16 rounded-lg mr-2"
                          className="w-16 h-16 rounded-lg"
                        />
                      ))}
                    </ScrollView>
                  )}
                  <Text className="font-body text-stone-gray text-xs mt-1">
                    {new Date(review.created_at).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}

            {reviews.length > 0 && (
              <Pressable
                onPress={() => router.push(`/activity-reviews/${activity.slug as string}` as never)}
                className="mt-2 self-start active:opacity-70"
              >
                <Text className="font-body text-angkor-orange font-semibold">
                  See all reviews →
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-gray/20 px-4 pt-3 flex-row items-center justify-between"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <View>
          <Text className="font-body text-stone-gray text-xs">From</Text>
          <Text className="font-heading text-xl text-angkor-orange">
            {formatPrice(activity.base_price_usd as string, currency)}
          </Text>
          <Text className="font-body text-stone-gray text-[10px]">per person</Text>
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
              },
            })
          }
          className="bg-angkor-orange rounded-xl px-7 py-3.5 active:bg-angkor-orange-dark"
        >
          <Text className="font-body text-white font-semibold text-base">Check Availability</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
