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

function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-card border border-gyg-border">
      <View className="flex-row items-center mb-2">
        <View className="w-10 h-10 rounded-full bg-gyg-navy items-center justify-center mr-3">
          <Text className="font-heading text-white text-sm font-bold">
            {review.user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-heading text-gyg-text text-sm">{review.user.name}</Text>
          <Text className="font-body text-gyg-muted text-xs">
            {new Date(review.created_at).toLocaleDateString(undefined, {
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
        <View className="flex-row items-center bg-gyg-bg rounded-lg px-2 py-1">
          <FontAwesome name="star" size={12} color="#D4AF37" />
          <Text className="font-body text-gyg-text ml-1 text-sm font-semibold">{review.rating}.0</Text>
        </View>
      </View>

      {review.comment && (
        <Text className="font-body text-gyg-text leading-5 mt-2">{review.comment}</Text>
      )}

      {review.images?.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          {review.images.map((image: ReviewImage, idx: number) => (
            <ImageWithFallback
              key={idx}
              uri={image.url}
              containerClassName="w-20 h-20 rounded-lg mr-2 bg-gyg-light"
              className="w-20 h-20 rounded-lg"
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

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

  const reviews: PublicReview[] = data?.pages.flatMap((p) => p.data) ?? [];
  const total = (data?.pages[0]?.total as number | undefined) ?? 0;
  const average = (activity?.avg_rating as number | undefined) ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-gyg-bg">
      <View className="px-5 pt-4 pb-3 bg-white border-b border-gyg-border">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-gyg-bg mb-3"
        >
          <FontAwesome name="arrow-left" size={20} color="#000C3B" />
        </Pressable>
        <Text className="font-heading text-2xl text-gyg-text">Reviews</Text>
        <Text className="font-body text-gyg-muted text-sm mt-1" numberOfLines={1}>
          {(activity?.title as string | undefined) ?? ''}
        </Text>
      </View>

      {average > 0 && (
        <View className="mx-4 mt-4 mb-2 bg-gyg-navy rounded-2xl p-4 shadow-card">
          <View className="flex-row items-center">
            <FontAwesome name="star" size={28} color="#D4AF37" />
            <Text className="font-heading text-3xl text-white ml-3">{average}</Text>
            <Text className="font-body text-white/70 ml-2">· {total} review{total === 1 ? '' : 's'}</Text>
          </View>
        </View>
      )}

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#000C3B" />
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
          renderItem={({ item }) => <ReviewCard review={item} />}
          contentContainerClassName="p-4"
          ListHeaderComponent={
            <Text className="font-body text-gyg-muted text-sm mb-3">
              Showing {reviews.length} of {total} review{total === 1 ? '' : 's'}
            </Text>
          }
          ListFooterComponent={
            hasNextPage ? (
              <Pressable
                onPress={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="mt-2 py-4 rounded-xl bg-gyg-navy active:bg-black items-center"
              >
                {isFetchingNextPage ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-body text-white font-semibold">Load more reviews</Text>
                )}
              </Pressable>
            ) : (
              <Text className="font-body text-gyg-muted text-center text-sm mt-4 mb-2">
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
