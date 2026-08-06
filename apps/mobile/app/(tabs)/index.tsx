import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';

import { fetchCategories, fetchCities, fetchActivities, type ActivityCard, type Category, type City } from '@/lib/publicApi';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { ConnectionDebug } from '@/components/ConnectionDebug';
import { TourCard } from '@/components/TourCard';
import { SectionHeader } from '@/components/SectionHeader';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/ImageWithFallback';
import { rewriteAssetUrl } from '@/lib/assetUrl';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof FontAwesome>['name']> = {
  tours: 'map-o',
  activities: 'ticket',
  adventure: 'tree',
  culture: 'university',
  food: 'cutlery',
  history: 'university',
  nature: 'tree',
  sightseeing: 'binoculars',
  default: 'compass',
};

function CategoryPill({ item }: { item: Category }) {
  const icon = CATEGORY_ICONS[item.slug] ?? CATEGORY_ICONS.default;

  return (
    <Pressable
      onPress={() => router.push(`/category/${item.slug}`)}
      className="flex-row items-center bg-white rounded-full px-4 py-2.5 mr-2.5 shadow-soft active:bg-gyg-bg"
    >
      <FontAwesome name={icon} size={14} color="#000C3B" />
      <Text className="font-body text-sm text-gyg-text font-semibold ml-2">{item.name}</Text>
    </Pressable>
  );
}

function CityCard({ item }: { item: City }) {
  return (
    <Pressable
      onPress={() => router.push(`/search?city=${item.slug}`)}
      className="relative w-40 h-48 rounded-2xl overflow-hidden mr-3 shadow-card active:opacity-90 bg-gyg-navy"
    >
      <View className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <View className="absolute top-3 left-3">
        <View className="w-9 h-9 rounded-full bg-white/20 backdrop-blur items-center justify-center">
          <FontAwesome name="map-marker" size={18} color="#fff" />
        </View>
      </View>
      <View className="absolute bottom-3 left-3 right-3">
        <Text className="font-heading text-white text-lg">{item.name}</Text>
        <Text className="font-body text-white/80 text-xs">
          {item.activities_count ?? 0} experience{(item.activities_count ?? 0) === 1 ? '' : 's'}
        </Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((state) => state.user);

  const greeting = useMemo(() => getGreeting(), []);

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(true),
  });

  const {
    data: cities,
    isLoading: citiesLoading,
    error: citiesError,
    refetch: refetchCities,
  } = useQuery({
    queryKey: ['cities'],
    queryFn: () => fetchCities(true),
  });

  const {
    data: featuredPage,
    isLoading: featuredLoading,
    error: featuredError,
    refetch: refetchFeatured,
  } = useQuery({
    queryKey: ['activities', 'featured'],
    queryFn: () => fetchActivities({ per_page: 8, featured: true }),
  });

  const {
    data: allPage,
    isLoading: allLoading,
    error: allError,
    refetch: refetchAll,
  } = useQuery({
    queryKey: ['activities', 'home'],
    queryFn: () => fetchActivities({ per_page: 10 }),
  });

  const isLoading = categoriesLoading || citiesLoading || featuredLoading || allLoading;
  const hasError = categoriesError || citiesError || featuredError || allError;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchCategories(),
      refetchCities(),
      refetchFeatured(),
      refetchAll(),
    ]);
    setRefreshing(false);
  }, [refetchCategories, refetchCities, refetchFeatured, refetchAll]);

  const renderFeatured = useCallback(
    ({ item }: { item: ActivityCard }) => (
      <TourCard activity={item} width={CARD_WIDTH} />
    ),
    []
  );

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg">
        <ScrollView className="flex-1">
          <View className="px-5 pt-4 pb-3">
            <Text className="font-body text-sm text-gyg-muted">{greeting}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</Text>
            <Text className="font-heading text-2xl text-gyg-text mt-0.5">Explore Cambodia</Text>
          </View>

          <View className="mx-5 mb-5 h-14 bg-gyg-light rounded-2xl" />

          <ConnectionDebug />

          <View className="px-5 mb-5">
            <View className="w-32 h-6 bg-gyg-light rounded mb-3" />
            <View className="flex-row">
              <View className="w-28 h-10 bg-gyg-light rounded-full mr-2.5" />
              <View className="w-28 h-10 bg-gyg-light rounded-full mr-2.5" />
              <View className="w-28 h-10 bg-gyg-light rounded-full" />
            </View>
          </View>

          <View className="px-5 mb-6">
            <View className="w-36 h-6 bg-gyg-light rounded mb-3" />
            <View className="flex-row">
              <View className="w-40 h-48 bg-gyg-light rounded-2xl mr-3" />
              <View className="w-40 h-48 bg-gyg-light rounded-2xl mr-3" />
            </View>
          </View>

          <View className="px-5 pb-8">
            <View className="w-24 h-6 bg-gyg-light rounded mb-3" />
            <View className="flex-row flex-wrap justify-between">
              <View className="w-[48%] h-64 bg-gyg-light rounded-2xl mb-4" />
              <View className="w-[48%] h-64 bg-gyg-light rounded-2xl mb-4" />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gyg-bg">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000C3B" />
        }
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-body text-sm text-gyg-muted">{greeting}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</Text>
              <Text className="font-heading text-2xl text-gyg-text mt-0.5">Explore Cambodia</Text>
              <Text className="font-body text-xs text-gyg-muted mt-0.5">Find things to do in Siem Reap</Text>
            </View>
            <Pressable
              onPress={() => router.push(user ? '/(tabs)/profile' : '/login')}
              className="w-11 h-11 rounded-full bg-white items-center justify-center shadow-soft active:bg-gyg-bg"
            >
              {user ? (
                <Avatar uri={rewriteAssetUrl(user.avatar_url)} name={user.name} size={40} />
              ) : (
                <FontAwesome name="user" size={20} color="#000C3B" />
              )}
            </Pressable>
          </View>
        </View>

        {/* Search bar */}
        <Pressable
          onPress={() => router.push('/search')}
          className="mx-5 mb-5 flex-row items-center bg-white rounded-2xl px-4 py-3.5 shadow-card active:bg-gyg-bg border border-gyg-border"
        >
          <View className="w-9 h-9 rounded-full bg-gyg-bg items-center justify-center mr-3">
            <FontAwesome name="search" size={16} color="#000C3B" />
          </View>
          <View className="flex-1">
            <Text className="font-body text-sm text-gyg-text font-semibold">Where do you want to go?</Text>
            <Text className="font-body text-xs text-gyg-muted">Search tours, categories, cities...</Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
        </Pressable>

        {/* Network diagnostics — always visible so users can fix connection issues */}
        <ConnectionDebug />

        {hasError && (
          <View className="px-4 mb-4">
            <ErrorState
              title="Could not load tours"
              error={categoriesError ?? citiesError ?? featuredError ?? allError}
              onRetry={onRefresh}
            />
          </View>
        )}

        {/* Categories */}
        {categories && categories.length > 0 && (
          <View className="mb-5">
            <View className="px-5 mb-3">
              <SectionHeader title="Categories" />
            </View>
            <FlatList
              data={categories}
              renderItem={({ item }) => <CategoryPill item={item} />}
              keyExtractor={(item) => `category-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            />
          </View>
        )}

        {/* Cities */}
        {cities && cities.length > 0 && (
          <View className="mb-6">
            <View className="px-5 mb-3">
              <SectionHeader title="Top destinations" actionLabel="See all" href="/search" />
            </View>
            <FlatList
              data={cities}
              renderItem={({ item }) => <CityCard item={item} />}
              keyExtractor={(item) => `city-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            />
          </View>
        )}

        {/* Featured carousel */}
        {featuredPage?.data && featuredPage.data.length > 0 && (
          <View className="mb-6">
            <View className="px-5 mb-3">
              <SectionHeader
                title="Top activities"
                subtitle="Hand-picked tours loved by travelers"
                actionLabel="See all"
                href="/search"
              />
            </View>
            <FlatList
              data={featuredPage.data}
              renderItem={renderFeatured}
              keyExtractor={(item) => `featured-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + 12}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 20 }}
              ItemSeparatorComponent={() => <View className="w-3" />}
            />
          </View>
        )}

        {/* All tours grid */}
        <View className="px-5 pb-8">
          <SectionHeader
            title="All tours"
            subtitle="Most popular things to do"
            actionLabel="See all"
            href="/search"
          />
          {allPage?.data && allPage.data.length > 0 ? (
            <View className="flex-row flex-wrap justify-between">
              {allPage.data.map((activity) => (
                <View key={`all-${activity.id}`} className="w-[48%] mb-4">
                  <TourCard activity={activity} />
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="map-o"
              title="No tours available yet"
              subtitle="Check back soon for new Cambodia experiences."
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
