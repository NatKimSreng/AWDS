import { useCallback } from 'react';
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

import { fetchCategories, fetchCities, fetchActivities, type ActivityCard } from '@/lib/publicApi';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatPrice } from '@/lib/formatCurrency';
import { CurrencyToggle } from '@/components/CurrencyToggle';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { EmptyState } from '@/components/EmptyState';

function ActivityCardItem({
  activity,
  currency,
}: {
  activity: ActivityCard;
  currency: 'USD' | 'KHR';
}) {
  return (
    <Pressable
      onPress={() => router.push(`/activity/${activity.slug}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm active:opacity-90 flex-1"
    >
      <View className="relative">
        <ImageWithFallback
          uri={activity.hero_image}
          containerClassName="h-32 w-full"
          className="h-32 w-full"
        />
        {activity.is_featured && (
          <View className="absolute top-2 left-2 bg-khmer-gold rounded-full px-2 py-0.5">
            <Text className="font-body text-[10px] text-white font-semibold">Featured</Text>
          </View>
        )}
      </View>
      <View className="p-3.5">
        <Text className="font-body text-[10px] text-stone-gray mb-1" numberOfLines={1}>
          {activity.category?.name} · {activity.city?.name}
        </Text>
        <Text className="font-heading text-sm text-stone-charcoal mb-2" numberOfLines={2} style={{ minHeight: 34 }}>
          {activity.title}
        </Text>
        <View className="flex-row items-center mb-2">
          <FontAwesome name="star" size={11} color="#D4AF37" />
          <Text className="font-body text-xs text-stone-gray ml-1">
            {activity.avg_rating} ({activity.reviews_count})
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <FontAwesome name="clock-o" size={11} color="#6B635C" />
            <Text className="font-body text-xs text-stone-gray ml-1">
              {Math.round(activity.duration_minutes / 60)}h
            </Text>
          </View>
          <Text className="font-body text-angkor-orange font-bold text-sm">
            {formatPrice(activity.base_price_usd, currency)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const {
    data: categories,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(true),
  });

  const {
    data: cities,
    isLoading: citiesLoading,
    refetch: refetchCities,
  } = useQuery({
    queryKey: ['cities'],
    queryFn: () => fetchCities(true),
  });

  const {
    data: activitiesPage,
    isLoading: activitiesLoading,
    refetch: refetchActivities,
  } = useQuery({
    queryKey: ['activities', 'home'],
    queryFn: () => fetchActivities({ per_page: 10 }),
  });

  const isLoading = categoriesLoading || citiesLoading || activitiesLoading;

  const onRefresh = useCallback(() => {
    refetchCategories();
    refetchCities();
    refetchActivities();
  }, [refetchCategories, refetchCities, refetchActivities]);

  const renderCategory = useCallback(
    ({ item }: { item: { id: number; name: string; slug: string } }) => (
      <Pressable
        onPress={() => router.push(`/category/${item.slug}`)}
        className="bg-white rounded-xl px-4 py-3 mr-3 shadow-sm"
      >
        <Text className="font-body text-stone-charcoal font-semibold">{item.name}</Text>
      </Pressable>
    ),
    []
  );

  const renderCity = useCallback(
    ({ item }: { item: { id: number; name: string; slug: string } }) => (
      <Pressable
        onPress={() => router.push(`/search?city=${item.slug}`)}
        className="bg-angkor-orange rounded-xl px-4 py-3 mr-3"
      >
        <Text className="font-body text-white font-semibold">{item.name}</Text>
      </Pressable>
    ),
    []
  );

  const currency = useSettingsStore((state) => state.currency);

  const renderActivity = useCallback(
    ({ item }: { item: ActivityCard }) => <ActivityCardItem activity={item} currency={currency} />,
    [currency]
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg">
        <View className="px-4 pt-4 pb-2">
          <Text className="font-heading text-2xl text-stone-charcoal">Explore Angkor</Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#C8530A" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
      <FlatList
        data={activitiesPage?.data ?? []}
        renderItem={renderActivity}
        keyExtractor={(item) => `activity-${item.id}`}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
        contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 28 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#C8530A" />}
        ListHeaderComponent={
          <View className="mb-3">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="font-heading text-2xl text-stone-charcoal">Explore Angkor</Text>
                <Text className="font-body text-xs text-stone-gray mt-0.5">
                  Discover tours in Siem Reap
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-24 mr-2">
                  <CurrencyToggle />
                </View>
                <Pressable
                  onPress={() => router.push('/search')}
                  className="w-10 h-10 rounded-full bg-angkor-orange/10 items-center justify-center active:bg-angkor-orange/20"
                >
                  <FontAwesome name="search" size={18} color="#C8530A" />
                </Pressable>
              </View>
            </View>

            {categories && categories.length > 0 && (
              <View className="mb-3">
                <FlatList
                  data={categories}
                  renderItem={renderCategory}
                  keyExtractor={(item) => `category-${item.id}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}

            {cities && cities.length > 0 && (
              <View className="mb-3">
                <FlatList
                  data={cities}
                  renderItem={renderCity}
                  keyExtractor={(item) => `city-${item.id}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}

            <Text className="font-heading text-base text-stone-charcoal mb-1">All tours</Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="map-o"
            title="No tours available yet"
            subtitle="Check back soon for new Angkor experiences."
          />
        }
      />
    </SafeAreaView>
  );
}
