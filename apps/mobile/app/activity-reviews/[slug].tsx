import { useLocalSearchParams, router } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { fetchPublicReviews, PublicReview, ReviewImage } from '@/lib/reviewApi';
import { fetchActivity } from '@/lib/publicApi';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { EmptyState } from '@/components/EmptyState';

export default function ActivityReviewsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const { data: activity } = useQuery({
    queryKey: ['activity', slug],
    queryFn: () => fetchActivity(slug),
    enabled: !!slug,
  });

  const {
    data,
    isLoading,
    isFetchingNextPage,
    error,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['activity-reviews-infinite', slug],
    queryFn: ({ pageParam }) => fetchPublicReviews(slug, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined,
    enabled: !!slug,
  });

  const reviews: PublicReview[] =
    data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const renderItem = ({ item: review }: { item: PublicReview }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-center mb-1">
        <View className="w-9 h-9 rounded-full bg-angkor-orange/10 items-center justify-center mr-2.5">
          <Text className="font-heading text-angkor-orange text-sm font-bold">
            {review.user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-heading text-stone-charcoal text-sm">{review.user.name}</Text>
          <Text className="font-body text-stone-gray text-xs">
            {new Date(review.created_at).toLocaleDateString(undefined, {
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
        <View className="flex-row items-center">
          <FontAwesome name="star" size={12} color="#D4AF37" />
          <Text className="font-body text-stone-charcoal ml-1 text-sm">{review.rating}.0</Text>
        </View>
      </View>
      {review.comment && (
        <Text className="font-body text-stone-charcoal leading-5 mt-2">{review.comment}</Text>
      )}
      {review.images?.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
          {review.images.map((image: ReviewImage, idx: number) => (
            <ImageWithFallback
              key={idx}
              uri={image.url}
              containerClassName="w-20 h-20 rounded-lg mr-2"
              className="w-20 h-20 rounded-lg"
            />
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
      <View className="px-5 py-4 border-b border-stone-gray/10 bg-white">
        <Pressable onPress={() => router.back()} className="mb-3">
          <FontAwesome name="arrow-left" size={20} color="#2B2622" />
        </Pressable>
        <Text className="font-heading text-xl text-stone-charcoal">Reviews</Text>
        <Text className="font-body text-stone-gray text-sm mt-1">
          {(activity?.title as string | undefined) ?? ''}
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#C8530A" />
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <EmptyState
            icon="frown-o"
            title="Couldn't load reviews"
            subtitle="Please try again later."
            actionLabel="Go back"
            onAction={() => router.back()}
          />
        </View>
      ) : reviews.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <EmptyState
            icon="comment-o"
            title="No reviews yet"
            subtitle="Be the first to review this tour."
            actionLabel="Go back"
            onAction={() => router.back()}
          />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerClassName="p-5"
          ListHeaderComponent={
            <Text className="font-body text-stone-gray text-sm mb-3">
              Showing {reviews.length} of {total} review{total === 1 ? '' : 's'}
            </Text>
          }
          ListFooterComponent={
            hasNextPage ? (
              <Pressable
                onPress={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="mt-2 py-3 rounded-xl bg-angkor-orange active:bg-angkor-orange-dark items-center"
              >
                {isFetchingNextPage ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-body text-white font-semibold">Load more reviews</Text>
                )}
              </Pressable>
            ) : (
              <Text className="font-body text-stone-gray text-center text-sm mt-4">
                You've reached the end.
              </Text>
            )
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
        />
      )}
    </SafeAreaView>
  );
}