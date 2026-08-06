import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { ImageWithFallback } from '@/components/ImageWithFallback';
import { formatPrice } from '@/lib/formatCurrency';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { toggleFavorite } from '@/lib/favoriteApi';
import { useState } from 'react';

export interface TourCardActivity {
  id: number;
  slug: string;
  title: string;
  base_price_usd: string | number;
  duration_minutes: number;
  min_group?: number;
  max_group?: number;
  avg_rating: number;
  reviews_count: number;
  is_featured?: boolean;
  is_instant_book?: boolean;
  category?: { name: string } | null;
  city?: { name: string } | null;
  hero_image?: string | null;
  favorite?: boolean;
}

interface TourCardProps {
  activity: TourCardActivity;
  variant?: 'vertical' | 'horizontal';
  width?: number;
  onFavoriteToggle?: (id: number, isFavorite: boolean) => void;
}

export function TourCard({ activity, variant = 'vertical', width, onFavoriteToggle }: TourCardProps) {
  const currency = useSettingsStore((state) => state.currency);
  const userId = useAuthStore((state) => state.user?.id);
  const [isFavorite, setIsFavorite] = useState(activity.favorite ?? false);
  const [toggling, setToggling] = useState(false);

  const durationHours = Math.round(activity.duration_minutes / 60);
  const isPrivate = activity.max_group != null && activity.max_group <= 6;

  const handleFavorite = async (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (!userId || toggling) return;
    setToggling(true);
    try {
      const next = await toggleFavorite(activity.id);
      setIsFavorite(next.is_favorite);
      onFavoriteToggle?.(activity.id, next.is_favorite);
    } catch {
      // ignore
    } finally {
      setToggling(false);
    }
  };

  const cardContent = (
    <>
      <View className="relative">
        <ImageWithFallback
          uri={activity.hero_image}
          containerClassName={variant === 'vertical' ? 'h-36 w-full' : 'w-28 h-28'}
          className={variant === 'vertical' ? 'h-36 w-full' : 'w-28 h-28'}
        />
        <View className="absolute inset-0 bg-black/10" />
        {(activity.is_featured || activity.is_instant_book) && (
          <View className="absolute top-2 left-2 flex-row gap-1">
            {activity.is_featured && (
              <View className="bg-white/95 rounded-md px-2 py-0.5">
                <Text className="font-body text-[10px] text-gyg-navy font-extrabold">Featured</Text>
              </View>
            )}
            {activity.is_instant_book && (
              <View className="bg-gyg-navy rounded-md px-2 py-0.5">
                <Text className="font-body text-[10px] text-white font-extrabold">Instant Book</Text>
              </View>
            )}
          </View>
        )}
        {userId && (
          <Pressable
            onPress={handleFavorite}
            disabled={toggling}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center z-10 ${
              isFavorite ? 'bg-gyg-navy' : 'bg-white/90'
            }`}
          >
            <FontAwesome
              name={isFavorite ? 'heart' : 'heart-o'}
              size={14}
              color={isFavorite ? '#fff' : '#000C3B'}
            />
          </Pressable>
        )}
      </View>

      <View className={variant === 'vertical' ? 'p-3.5' : 'p-4 flex-1 justify-between'}>
        <View>
          <View className="flex-row items-center gap-1.5 mb-1.5">
            <FontAwesome name="clock-o" size={11} color="#6B7280" />
            <Text className="font-body text-[11px] text-gyg-muted font-semibold">
              {durationHours}h · {isPrivate ? 'Private' : 'Small group'}
            </Text>
          </View>
          <Text
            className="font-heading text-sm text-gyg-text leading-5 mb-2"
            numberOfLines={2}
            style={{ minHeight: 38 }}
          >
            {activity.title}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <FontAwesome name="star" size={11} color="#D4AF37" />
            <Text className="font-body text-xs text-gyg-muted ml-1">
              {activity.avg_rating} ({activity.reviews_count})
            </Text>
          </View>
          <View className="items-end">
            <Text className="font-body text-[10px] text-gyg-muted">From</Text>
            <Text className="font-heading text-base text-gyg-navy">
              {formatPrice(String(activity.base_price_usd), currency)}
            </Text>
          </View>
        </View>
      </View>
    </>
  );

  return (
    <Pressable
      onPress={() => router.push(`/activity/${activity.slug}`)}
      className={`bg-white rounded-2xl overflow-hidden shadow-card active:opacity-90 ${
        variant === 'horizontal' ? 'flex-row' : ''
      }`}
      style={width ? { width } : undefined}
    >
      {cardContent}
    </Pressable>
  );
}
