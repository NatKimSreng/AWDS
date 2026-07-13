import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchActivity } from '@/lib/publicApi';
import { formatPrice } from '@/lib/formatCurrency';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { fetchFavoriteStatus, toggleFavorite } from '@/lib/favoriteApi';
import { fetchPublicReviews, PublicReview } from '@/lib/reviewApi';

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

  const { data: reviewsResponse } = useQuery({
    queryKey: ['activity-reviews', slug],
    queryFn: () => fetchPublicReviews(slug),
    enabled: !!slug,
  });

  const reviews = reviewsResponse?.data ?? [];

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
        <Text className="font-body text-stone-gray">Tour not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="font-body text-angkor-orange font-semibold">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const durationHours = Math.round((activity.duration_minutes as number) / 60);
  const languages = ((activity.spoken_languages as string[]) ?? []).join(', ').toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
      <ScrollView className="flex-1">
        <View className="h-56 bg-stone-gray/20 relative">
          <Pressable
            onPress={() => router.back()}
            className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full items-center justify-center z-10"
          >
            <FontAwesome name="arrow-left" size={18} color="#2B2622" />
          </Pressable>

          {userId && (
            <Pressable
              onPress={() => favoriteMutation.mutate()}
              disabled={favoriteMutation.isPending}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full items-center justify-center z-10"
            >
              <FontAwesome
                name={isFavorite ? 'heart' : 'heart-o'}
                size={20}
                color={isFavorite ? '#C8530A' : '#2B2622'}
              />
            </Pressable>
          )}
        </View>

        <View className="p-5">
          <View className="flex-row items-center mb-2">
            <Text className="font-body text-sm text-stone-gray">
              {(activity.category as { name: string } | null)?.name} ·{' '}
              {(activity.city as { name: string } | null)?.name}
            </Text>
          </View>

          <Text className="font-heading text-2xl text-stone-charcoal mb-3">
            {activity.title as string}
          </Text>

          <View className="flex-row items-center mb-4">
            <FontAwesome name="star" size={16} color="#D4AF37" />
            <Text className="font-body text-stone-charcoal ml-1 mr-3">
              {activity.avg_rating as number} ({activity.reviews_count as number} reviews)
            </Text>
            <FontAwesome name="clock-o" size={16} color="#6B635C" />
            <Text className="font-body text-stone-gray ml-1">
              {durationHours}h
            </Text>
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

          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <Text className="font-heading text-lg text-stone-charcoal mb-2">Meeting Point</Text>
            <Text className="font-body text-stone-gray">
              {((activity.meeting_point as Record<string, string> | null)?.address) ?? 'Not specified'}
            </Text>
          </View>

          {languages && (
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="font-heading text-lg text-stone-charcoal mb-1">Languages</Text>
              <Text className="font-body text-stone-gray">{languages}</Text>
            </View>
          )}

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
                  <Text className="font-body text-stone-gray text-xs mt-1">
                    {new Date(review.created_at).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-gray/20 p-4 flex-row items-center justify-between">
        <View>
          <Text className="font-body text-stone-gray text-sm">From</Text>
          <Text className="font-heading text-xl text-angkor-orange">
            {formatPrice(activity.base_price_usd as string, currency)}
          </Text>
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
          className="bg-angkor-orange rounded-xl px-6 py-3 active:bg-angkor-orange-dark"
        >
          <Text className="font-body text-white font-semibold">Check Availability</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
