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
      className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4"
    >
      <View className="h-40 bg-stone-gray/20" />
      <View className="p-4">
        <View className="flex-row items-center mb-1">
          {activity.is_featured && (
            <View className="bg-khmer-gold/20 rounded-full px-2 py-0.5 mr-2">
              <Text className="font-body text-xs text-khmer-gold font-semibold">Featured</Text>
            </View>
          )}
          <Text className="font-body text-xs text-stone-gray">
            {activity.category?.name} · {activity.city?.name}
          </Text>
        </View>
        <Text className="font-heading text-lg text-stone-charcoal mb-1" numberOfLines={2}>
          {activity.title}
        </Text>
        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center">
            <FontAwesome name="clock-o" size={14} color="#6B635C" />
            <Text className="font-body text-sm text-stone-gray ml-1">
              {Math.round(activity.duration_minutes / 60)}h
            </Text>
          </View>
          <View className="flex-row items-center">
            <FontAwesome name="star" size={14} color="#D4AF37" />
            <Text className="font-body text-sm text-stone-gray ml-1">
              {activity.avg_rating} ({activity.reviews_count})
            </Text>
          </View>
          <Text className="font-body text-angkor-orange font-semibold">
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
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center">
        <ActivityIndicator color="#C8530A" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
      <FlatList
        data={activitiesPage?.data ?? []}
        renderItem={renderActivity}
        keyExtractor={(item) => `activity-${item.id}`}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#C8530A" />}
        ListHeaderComponent={
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-heading text-2xl text-stone-charcoal">Explore Angkor</Text>
              <View className="flex-row items-center">
                <View className="w-24 mr-3">
                  <CurrencyToggle />
                </View>
                <Pressable onPress={() => router.push('/search')}>
                  <FontAwesome name="search" size={22} color="#C8530A" />
                </Pressable>
              </View>
            </View>

            {categories && categories.length > 0 && (
              <View className="mb-4">
                <Text className="font-heading text-lg text-stone-charcoal mb-2">Categories</Text>
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
              <View className="mb-4">
                <Text className="font-heading text-lg text-stone-charcoal mb-2">Destinations</Text>
                <FlatList
                  data={cities}
                  renderItem={renderCity}
                  keyExtractor={(item) => `city-${item.id}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}

            <Text className="font-heading text-lg text-stone-charcoal mb-2">Featured Tours</Text>
          </View>
        }
        ListEmptyComponent={
          <View className="py-12 items-center">
            <Text className="font-body text-stone-gray">No activities available yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
