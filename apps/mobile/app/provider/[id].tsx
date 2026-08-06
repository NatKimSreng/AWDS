import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';

import { fetchProvider, ProviderActivity } from '@/lib/publicApi';
import { formatPrice } from '@/lib/formatCurrency';
import { useSettingsStore } from '@/stores/settingsStore';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { EmptyState } from '@/components/EmptyState';

function ProviderActivityCard({ activity }: { activity: ProviderActivity }) {
  const currency = useSettingsStore((state) => state.currency);
  const durationHours = Math.round(activity.duration_minutes / 60);

  return (
    <Pressable
      onPress={() => router.push(`/activity/${activity.slug}`)}
      className="bg-white rounded-2xl shadow-card border border-gyg-border overflow-hidden mb-4 active:opacity-90"
    >
      <ImageWithFallback
        uri={activity.hero_image ?? undefined}
        containerClassName="h-40 w-full bg-gyg-light"
        className="h-40 w-full"
      />
      <View className="p-4">
        <Text className="font-heading text-lg text-gyg-text mb-1.5" numberOfLines={2}>
          {activity.title}
        </Text>
        <View className="flex-row items-center flex-wrap gap-y-1 mb-2">
          <View className="flex-row items-center mr-4">
            <FontAwesome name="star" size={13} color="#D4AF37" />
            <Text className="font-body text-gyg-text text-sm ml-1">
              {activity.avg_rating} ({activity.reviews_count})
            </Text>
          </View>
          <View className="flex-row items-center">
            <FontAwesome name="clock-o" size={13} color="#6B7280" />
            <Text className="font-body text-gyg-muted text-sm ml-1">{durationHours}h</Text>
          </View>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="font-heading text-gyg-navy">
            {formatPrice(activity.base_price_usd, currency)}
          </Text>
          <View className="flex-row items-center">
            <Text className="font-body text-gyg-muted text-sm mr-1">View</Text>
            <FontAwesome name="chevron-right" size={12} color="#9CA3AF" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function ProviderProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currency = useSettingsStore((state) => state.currency);

  const { data: provider, isLoading, error } = useQuery({
    queryKey: ['provider', id],
    queryFn: () => fetchProvider(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg justify-center items-center">
        <ActivityIndicator color="#000C3B" />
      </SafeAreaView>
    );
  }

  if (error || !provider) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg px-6">
        <View className="py-4">
          <Pressable onPress={() => router.back()} className="self-start w-10 h-10 items-center justify-center rounded-full active:bg-gyg-light">
            <FontAwesome name="arrow-left" size={20} color="#000C3B" />
          </Pressable>
        </View>
        <EmptyState
          icon="frown-o"
          title="Provider not found"
          subtitle="We couldn't load this provider profile."
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const initial = provider.business_name?.charAt(0).toUpperCase() ?? 'P';
  const hasActivities = provider.activities.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-gyg-bg">
      <ScrollView className="flex-1">
        <View className="relative bg-gyg-navy pb-8">
          <View className="absolute top-0 left-0 right-0 h-24 bg-black/10" />
          <View className="relative px-6 pt-4 pb-6">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/15 rounded-full items-center justify-center mb-6 active:bg-white/25"
            >
              <FontAwesome name="arrow-left" size={18} color="#FFFFFF" />
            </Pressable>

            <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center self-center mb-4 border-4 border-white/10">
              <Text className="font-heading text-3xl text-white">{initial}</Text>
            </View>

            <Text className="font-heading text-2xl text-white text-center mb-2">
              {provider.business_name}
            </Text>

            <View className="flex-row items-center justify-center flex-wrap gap-x-5 gap-y-1 mb-3">
              <View className="flex-row items-center">
                <FontAwesome name="star" size={16} color="#D4AF37" />
                <Text className="font-body text-white ml-1.5">
                  {provider.avg_rating} rating
                </Text>
              </View>
              <View className="flex-row items-center">
                <FontAwesome name="suitcase" size={14} color="rgba(255,255,255,0.7)" />
                <Text className="font-body text-white/80 ml-1.5">
                  {provider.total_bookings} bookings
                </Text>
              </View>
            </View>

            {provider.service_area && (
              <View className="flex-row items-center justify-center">
                <FontAwesome name="map-marker" size={14} color="#D4AF37" />
                <Text className="font-body text-white/90 ml-1.5">
                  {provider.service_area}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="px-5 -mt-5 pb-8">
          {provider.bio ? (
            <View className="bg-white rounded-2xl p-5 shadow-card border border-gyg-border mb-4">
              <Text className="font-heading text-lg text-gyg-text mb-2">About</Text>
              <Text className="font-body text-gyg-muted leading-5">{provider.bio}</Text>
            </View>
          ) : null}

          <View className="bg-white rounded-2xl p-4 shadow-card border border-gyg-border mb-5 flex-row items-center justify-between">
            <View>
              <Text className="font-body text-gyg-muted text-sm">Experiences listed</Text>
              <Text className="font-heading text-2xl text-gyg-text">
                {provider.activities_count}
              </Text>
            </View>
            <FontAwesome name="list" size={22} color="#000C3B" />
          </View>

          <View className="flex-row items-center justify-between mb-3 mt-1">
            <Text className="font-heading text-xl text-gyg-text">Experiences</Text>
            <Text className="font-body text-gyg-muted text-sm">
              {provider.activities.length} result{provider.activities.length === 1 ? '' : 's'}
            </Text>
          </View>

          {hasActivities ? (
            <FlatList
              data={provider.activities}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <ProviderActivityCard activity={item} />}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            />
          ) : (
            <EmptyState
              icon="cube"
              title="No experiences yet"
              subtitle="This provider hasn't published any tours."
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
