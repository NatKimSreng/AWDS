import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';

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

  const { data, isLoading } = useQuery<SearchResult>({
    queryKey: ['search', query],
    queryFn: () => fetchSearch(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 60,
  });

  const renderActivity = useCallback(
    ({ item }: { item: SearchResult['activities'][0] }) => (
      <Pressable
        onPress={() => router.push(`/activity/${item.slug}`)}
        className="flex-row items-center bg-white rounded-xl p-3 mb-3 shadow-sm"
      >
        <View className="w-16 h-16 rounded-lg bg-stone-gray/20 mr-3 overflow-hidden">
          {/* Image placeholder — replace with Image component once URLs are real */}
        </View>
        <View className="flex-1">
          <Text className="font-body text-stone-charcoal font-semibold" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="font-body text-angkor-orange text-sm">
            ${item.base_price_usd}
          </Text>
        </View>
        <FontAwesome name="chevron-right" size={14} color="#6B635C" />
      </Pressable>
    ),
    []
  );

  const renderCategory = useCallback(
    ({ item }: { item: SearchResult['categories'][0] }) => (
      <Pressable
        onPress={() => router.push(`/category/${item.slug}`)}
        className="bg-angkor-orange/10 rounded-full px-4 py-2 mr-2"
      >
        <Text className="font-body text-angkor-orange text-sm">{item.name}</Text>
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
          <FontAwesome name="search" size={48} color="#C8530A" />
          <Text className="font-body text-stone-gray text-center mt-4">
            Type at least 2 characters to find tours, categories, and cities.
          </Text>
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
          ListHeaderComponent={
            data?.categories?.length ? (
              <View className="mb-4">
                <Text className="font-heading text-lg text-stone-charcoal mb-2">
                  Categories
                </Text>
                <FlatList
                  data={data.categories}
                  renderItem={renderCategory}
                  keyExtractor={(item) => `category-${item.id}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="py-12 items-center">
              <Text className="font-body text-stone-gray">No results found for "{query}"</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
