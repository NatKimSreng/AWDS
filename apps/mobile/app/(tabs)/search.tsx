import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import { formatPrice } from '@/lib/formatCurrency';
import { useSettingsStore } from '@/stores/settingsStore';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { EmptyState } from '@/components/EmptyState';

interface SearchResult {
  activities: Array<{
    id: number;
    title: string;
    slug: string;
    base_price_usd: string;
    hero_image: string | null;
  }>;
  categories: Array<{ id: number; name: string; slug: string; icon: string | null }>;
  cities: Array<{ id: number; name: string; slug: string }>;
}

function fetchSearch(q: string): Promise<SearchResult> {
  return apiFetch(`/public/search?q=${encodeURIComponent(q)}`) as Promise<SearchResult>;
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');

  const { data, isLoading, refetch } = useQuery<SearchResult>({
    queryKey: ['search', query],
    queryFn: () => fetchSearch(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 60,
  });

  const currency = useSettingsStore((state) => state.currency);

  const renderActivity = useCallback(
    ({ item }: { item: SearchResult['activities'][0] }) => (
      <Pressable
        onPress={() => router.push(`/activity/${item.slug}`)}
        className="flex-row items-center bg-white rounded-xl p-3 mb-3 shadow-sm"
      >
        <ImageWithFallback
          uri={item.hero_image}
          containerClassName="w-16 h-16 rounded-lg mr-3"
          className="w-16 h-16 rounded-lg"
        />
        <View className="flex-1">
          <Text className="font-body text-stone-charcoal font-semibold" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="font-body text-angkor-orange text-sm">
            {formatPrice(item.base_price_usd, currency)}
          </Text>
        </View>
        <FontAwesome name="chevron-right" size={14} color="#6B635C" />
      </Pressable>
    ),
    []
  );

  const renderCategoryChip = useCallback(
    ({ item }: { item: SearchResult['categories'][0] }) => (
      <Pressable
        onPress={() => router.push(`/category/${item.slug}`)}
        className="rounded-full px-4 py-2 mr-2 bg-angkor-orange/10"
      >
        <Text className="font-body text-sm text-angkor-orange">
          {item.icon ? `${item.icon} ` : ''}
          {item.name}
        </Text>
      </Pressable>
    ),
    []
  );

  const renderCityChip = useCallback(
    ({ item }: { item: SearchResult['cities'][0] }) => (
      <Pressable
        onPress={() => router.push(`/search?city=${item.slug}`)}
        className="rounded-full px-4 py-2 mr-2 bg-stone-charcoal/10"
      >
        <Text className="font-body text-sm text-stone-charcoal">{item.name}</Text>
      </Pressable>
    ),
    []
  );

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
      <View className="px-4 py-3">
        <View className="flex-row items-center bg-white rounded-xl px-4 py-3 shadow-sm">
          <FontAwesome name="search" size={18} color="#6B635C" />
          <TextInput
            className="flex-1 ml-3 font-body text-stone-charcoal"
            placeholder="Search tours, categories, cities..."
            placeholderTextColor="#6B635C"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <FontAwesome name="times-circle" size={18} color="#6B635C" />
            </Pressable>
          )}
        </View>
      </View>

      {query.length < 2 ? (
        <View className="flex-1 justify-center items-center px-8">
          <EmptyState
            icon="search"
            title="Find your next tour"
            subtitle="Search tours, categories, and destinations."
          />
        </View>
      ) : isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#C8530A" />
        </View>
      ) : (
        <FlatList
          data={data?.activities ?? []}
          renderItem={renderActivity}
          keyExtractor={(item) => `activity-${item.id}`}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#C8530A" />
          }
          ListHeaderComponent={
            <View>
              {data?.categories != null && data.categories.length > 0 && (
                <View className="mb-4">
                  <Text className="font-heading text-lg text-stone-charcoal mb-2">
                    Categories
                  </Text>
                  <FlatList
                    data={data.categories}
                    renderItem={renderCategoryChip}
                    keyExtractor={(item) => `category-${item.id}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  />
                </View>
              )}
              {data?.cities != null && data.cities.length > 0 && (
                <View className="mb-4">
                  <Text className="font-heading text-lg text-stone-charcoal mb-2">
                    Destinations
                  </Text>
                  <FlatList
                    data={data.cities}
                    renderItem={renderCityChip}
                    keyExtractor={(item) => `city-${item.id}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  />
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon="search"
              title="No results found"
              subtitle={`We couldn't find anything matching "${query}".`}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
