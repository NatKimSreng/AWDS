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

import { fetchFavorites, toggleFavorite, type Favorite } from '@/lib/favoriteApi';
import { formatPrice } from '@/lib/formatCurrency';
import { useSettingsStore } from '@/stores/settingsStore';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';

function FavoriteCard({ favorite, onToggle }: { favorite: Favorite; onToggle: () => void }) {
  const currency = useSettingsStore((state) => state.currency);

  return (
    <Pressable
      onPress={() => router.push(`/activity/${favorite.activity.slug}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-card border border-gyg-border mb-4 active:opacity-90"
    >
      <View className="flex-row">
        <ImageWithFallback
          uri={favorite.activity.hero_image}
          containerClassName="w-28 h-28 bg-gyg-light"
          className="w-28 h-28"
        />
        <View className="flex-1 p-4 justify-between">
          <View>
            <Text className="font-heading text-sm text-gyg-text" numberOfLines={2}>
              {favorite.activity.title}
            </Text>
            <View className="flex-row items-center mt-1.5">
              <FontAwesome name="star" size={11} color="#D4AF37" />
              <Text className="font-body text-xs text-gyg-muted ml-1">
                {favorite.activity.avg_rating} ({favorite.activity.reviews_count})
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <Text className="font-body text-gyg-navy font-bold">
              {formatPrice(favorite.activity.base_price_usd, currency)}
            </Text>
            <Pressable
              onPress={onToggle}
              className="w-9 h-9 rounded-full bg-gyg-bg items-center justify-center active:bg-gyg-light"
            >
              <FontAwesome name="heart" size={18} color="#000C3B" />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function FavoritesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: favorites,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg justify-center items-center">
        <ActivityIndicator color="#000C3B" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg px-4">
        <View className="pt-4 pb-2">
          <Text className="font-heading text-2xl text-gyg-text">Favorites</Text>
        </View>
        <ErrorState title="Could not load favorites" error={error} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gyg-bg">
      <View className="px-4 pt-4 pb-2">
        <Text className="font-heading text-2xl text-gyg-text">Favorites</Text>
        <Text className="font-body text-sm text-gyg-muted">
          Tours and experiences you saved.
        </Text>
      </View>

      <FlatList
        data={favorites ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <FavoriteCard
            favorite={item}
            onToggle={async () => {
              await toggleFavorite(item.activity_id);
              refetch();
            }}
          />
        )}
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000C3B" />
        }
        ListEmptyComponent={
          <View className="py-12">
            <EmptyState
              icon="heart-o"
              title="No favorites yet"
              subtitle="Save tours you love to find them quickly."
              actionLabel="Explore tours"
              onAction={() => router.push('/')}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}
