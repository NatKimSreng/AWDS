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

import { fetchFavorites, toggleFavorite, type Favorite } from '@/lib/favoriteApi';
import { formatPrice } from '@/lib/formatCurrency';
import { useSettingsStore } from '@/stores/settingsStore';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { EmptyState } from '@/components/EmptyState';

function FavoriteCard({ favorite, onToggle }: { favorite: Favorite; onToggle: () => void }) {
  const currency = useSettingsStore((state) => state.currency);

  return (
    <Pressable
      onPress={() => router.push(`/activity/${favorite.activity.slug}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4 active:opacity-90"
    >
      <View className="flex-row">
        <ImageWithFallback
          uri={favorite.activity.hero_image}
          containerClassName="w-28 h-28"
          className="w-28 h-28"
        />
        <View className="flex-1 p-4 justify-between">
          <View>
            <Text className="font-heading text-base text-stone-charcoal" numberOfLines={2}>
              {favorite.activity.title}
            </Text>
            <View className="flex-row items-center mt-1">
              <FontAwesome name="star" size={12} color="#D4AF37" />
              <Text className="font-body text-stone-gray text-sm ml-1">
                {favorite.activity.avg_rating} ({favorite.activity.reviews_count})
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <Text className="font-body text-angkor-orange font-semibold">
              {formatPrice(favorite.activity.base_price_usd, currency)}
            </Text>
            <Pressable onPress={onToggle} className="p-2">
              <FontAwesome name="heart" size={20} color="#C8530A" />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function FavoritesScreen() {
  const { data: favorites, isLoading, refetch } = useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
  });

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
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#C8530A" />
        }
        ListEmptyComponent={
          <EmptyState
            icon="heart-o"
            title="No favorites yet"
            subtitle="Save tours you love to find them quickly."
            actionLabel="Explore tours"
            onAction={() => router.push('/')}
          />
        }
      />
    </SafeAreaView>
  );
}
