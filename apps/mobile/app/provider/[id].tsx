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
      className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4 active:opacity-90"
    >
      <ImageWithFallback
        uri={activity.hero_image ?? undefined}
        containerClassName="h-40 w-full"
        className="h-40 w-full"
      />
      <View className="p-4">
        <Text className="font-heading text-lg text-stone-charcoal mb-1" numberOfLines={2}>
          {activity.title}
        </Text>
        <View className="flex-row items-center flex-wrap gap-y-1 mb-2">
          <View className="flex-row items-center mr-4">
            <FontAwesome name="star" size={14} color="#D4AF37" />
            <Text className="font-body text-stone-charcoal text-sm ml-1">
              {activity.avg_rating} ({activity.reviews_count})
            </Text>
          </View>
          <View className="flex-row items-center">
            <FontAwesome name="clock-o" size={14} color="#6B635C" />
            <Text className="font-body text-stone-gray text-sm ml-1">{durationHours}h</Text>
          </View>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="font-heading text-angkor-orange">
            {formatPrice(activity.base_price_usd, currency)}
          </Text>
          <View className="flex-row items-center">
            <Text className="font-body text-stone-gray text-sm mr-1">View</Text>
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
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center">
        <ActivityIndicator color="#C8530A" />
      </SafeAreaView>
    );
  }

  if (error || !provider) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg px-6">
        <View className="py-4">
          <Pressable onPress={() => router.back()} className="self-start">
            <FontAwesome name="arrow-left" size={22} color="#2B2622" />
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
    <SafeAreaView className="flex-1 bg-sand-bg">
      <ScrollView className="flex-1">
        <View className="relative bg-angkor-orange/10 pb-6">
          <View className="bg-black/5 absolute inset-0" />
          <View className="relative px-6 pt-4 pb-6">
            <Pressable
              onPress={() => router.back()}
              className="w-11 h-11 bg-white/90 rounded-full items-center justify-center mb-4 active:bg-white"
            >
              <FontAwesome name="arrow-left" size={18} color="#2B2622" />
            </Pressable>

            <View className="w-24 h-24 rounded-full bg-angkor-orange items-center justify-center self-center mb-4 shadow-sm">
              <Text className="font-heading text-3xl text-white">{initial}</Text>
            </View>

            <Text className="font-heading text-2xl text-stone-charcoal text-center mb-1">
              {provider.business_name}
            </Text>

            <View className="flex-row items-center justify-center flex-wrap gap-x-4 gap-y-1 mb-3">
              <View className="flex-row items-center">
                <FontAwesome name="star" size={16} color="#D4AF37" />
                <Text className="font-body text-stone-charcoal ml-1">
                  {provider.avg_rating} rating
                </Text>
              </View>
              <View className="flex-row items-center">
                <FontAwesome name="suitcase" size={14} color="#6B635C" />
                <Text className="font-body text-stone-gray ml-1">
                  {provider.total_bookings} bookings
                </Text>
              </View>
            </View>

            {provider.service_area && (
              <View className="flex-row items-center justify-center">
                <FontAwesome name="map-marker" size={14} color="#C8530A" />
                <Text className="font-body text-stone-charcoal ml-1">
                  {provider.service_area}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="px-5 -mt-4 pb-8">
          {provider.bio ? (
            <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
              <Text className="font-heading text-lg text-stone-charcoal mb-2">About</Text>
              <Text className="font-body text-stone-gray leading-5">{provider.bio}</Text>
            </View>
          ) : null}

          <View className="bg-white rounded-2xl p-4 shadow-sm mb-5 flex-row items-center justify-between">
            <View>
              <Text className="font-body text-stone-gray text-sm">Experiences listed</Text>
              <Text className="font-heading text-2xl text-stone-charcoal">
                {provider.activities_count}
              </Text>
            </View>
            <FontAwesome name="list" size={22} color="#C8530A" />
          </View>

          <View className="flex-row items-center justify-between mb-3 mt-1">
            <Text className="font-heading text-xl text-stone-charcoal">Experiences</Text>
            <Text className="font-body text-stone-gray text-sm">
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
