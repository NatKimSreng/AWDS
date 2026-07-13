import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';

import { fetchActivity } from '@/lib/publicApi';
import { formatPrice } from '@/lib/formatCurrency';
import { useSettingsStore } from '@/stores/settingsStore';

export default function ActivityDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const currency = useSettingsStore((state) => state.currency);

  const { data: activity, isLoading } = useQuery({
    queryKey: ['activity', slug],
    queryFn: () => fetchActivity(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center">
        <ActivityIndicator color="#C8530A" />
      </SafeAreaView>
    );
  }

  if (!activity) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center px-6">
        <Text className="font-body text-stone-gray">Tour not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="font-body text-angkor-orange font-semibold">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const durationHours = Math.round((activity.duration_minutes as number) / 60);
  const languages = ((activity.spoken_languages as string[]) ?? []).join(', ').toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
      <ScrollView className="flex-1">
        <View className="h-56 bg-stone-gray/20 relative">
          <Pressable
            onPress={() => router.back()}
            className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full items-center justify-center z-10"
          >
            <FontAwesome name="arrow-left" size={18} color="#2B2622" />
          </Pressable>
        </View>

        <View className="p-5">
          <View className="flex-row items-center mb-2">
            <Text className="font-body text-sm text-stone-gray">
              {(activity.category as { name: string } | null)?.name} ·{' '}
              {(activity.city as { name: string } | null)?.name}
            </Text>
          </View>

          <Text className="font-heading text-2xl text-stone-charcoal mb-3">
            {activity.title as string}
          </Text>

          <View className="flex-row items-center mb-4">
            <FontAwesome name="star" size={16} color="#D4AF37" />
            <Text className="font-body text-stone-charcoal ml-1 mr-3">
              {activity.avg_rating as number} ({activity.reviews_count as number} reviews)
            </Text>
            <FontAwesome name="clock-o" size={16} color="#6B635C" />
            <Text className="font-body text-stone-gray ml-1">
              {durationHours}h
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <Text className="font-heading text-lg text-stone-charcoal mb-2">About</Text>
            <Text className="font-body text-stone-gray leading-5">
              {activity.description as string}
            </Text>
          </View>

          {Array.isArray(activity.itinerary) && (activity.itinerary as Array<{ time: string; description: string }>).length > 0 && (
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="font-heading text-lg text-stone-charcoal mb-3">Itinerary</Text>
              {(activity.itinerary as Array<{ time: string; description: string }>).map((item, index) => (
                <View key={index} className="flex-row mb-3">
                  <Text className="font-body text-angkor-orange font-semibold w-16">{item.time}</Text>
                  <Text className="font-body text-stone-gray flex-1">{item.description}</Text>
                </View>
              ))}
            </View>
          )}

          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <Text className="font-heading text-lg text-stone-charcoal mb-2">Meeting Point</Text>
            <Text className="font-body text-stone-gray">
              {((activity.meeting_point as Record<string, string> | null)?.address) ?? 'Not specified'}
            </Text>
          </View>

          {languages && (
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="font-heading text-lg text-stone-charcoal mb-1">Languages</Text>
              <Text className="font-body text-stone-gray">{languages}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-gray/20 p-4 flex-row items-center justify-between">
        <View>
          <Text className="font-body text-stone-gray text-sm">From</Text>
          <Text className="font-heading text-xl text-angkor-orange">
            {formatPrice(activity.base_price_usd as string, currency)}
          </Text>
        </View>
        <Pressable className="bg-angkor-orange rounded-xl px-6 py-3 active:bg-angkor-orange-dark">
          <Text className="font-body text-white font-semibold">Check Availability</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
