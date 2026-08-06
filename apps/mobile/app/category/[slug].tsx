import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { fetchCategories, fetchActivities, type ActivityCard } from '@/lib/publicApi';
import { TourCard } from '@/components/TourCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';

const SORTS = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'price_asc', label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'rating', label: 'Top Rated' },
];

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState('recommended');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(),
  });

  const {
    data: activitiesPage,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['activities', 'category', slug, sort],
    queryFn: () => fetchActivities({
      category: slug,
      per_page: 20,
      sort: sort === 'recommended' ? undefined : sort as any,
    }),
    enabled: !!slug,
  });

  const category = categories?.find((c) => c.slug === slug);
  const count = activitiesPage?.data?.length ?? 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gyg-bg">
      <View className="px-4 py-3 bg-white border-b border-gyg-border">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gyg-bg items-center justify-center mr-3 active:bg-gyg-light"
          >
            <FontAwesome name="arrow-left" size={18} color="#000C3B" />
          </Pressable>
          <View className="flex-1">
            <Text className="font-heading text-xl text-gyg-text" numberOfLines={1}>{category?.name ?? 'Category'}</Text>
            <Text className="font-body text-xs text-gyg-muted">
              {count} experience{count === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        {/* Sort chips */}
        <FlatList
          data={SORTS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSort(item.key)}
              className={`rounded-full px-3.5 py-1.5 mr-2 mt-3 border ${
                sort === item.key
                  ? 'bg-gyg-navy border-gyg-navy'
                  : 'bg-white border-gyg-border active:bg-gyg-bg'
              }`}
            >
              <Text
                className={`font-body text-xs font-semibold ${
                  sort === item.key ? 'text-white' : 'text-gyg-text'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#000C3B" />
        </View>
      ) : error ? (
        <ErrorState title="Could not load category" error={error} onRetry={refetch} />
      ) : (
        <FlatList
          data={activitiesPage?.data ?? []}
          renderItem={({ item }: { item: ActivityCard }) => (
            <View className="px-4 mb-4">
              <TourCard activity={item} variant="horizontal" />
            </View>
          )}
          keyExtractor={(item) => `activity-${item.id}`}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 28 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000C3B" />
          }
          ListEmptyComponent={
            <View className="py-12">
              <EmptyState
                icon="folder-open-o"
                title="No tours found"
                subtitle="Try another category or explore all tours."
                actionLabel="Explore all"
                onAction={() => router.push('/search')}
              />
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
