import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';

import { fetchCategories, fetchActivities, type ActivityCard } from '@/lib/publicApi';
import { formatPrice } from '@/lib/formatCurrency';
import { useSettingsStore } from '@/stores/settingsStore';

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
          <Text className="font-body text-angkor-orange font-semibold">
            {formatPrice(activity.base_price_usd, currency)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const currency = useSettingsStore((state) => state.currency);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(),
  });

  const { data: activitiesPage, isLoading } = useQuery({
    queryKey: ['activities', 'category', slug],
    queryFn: () => fetchActivities({ category: slug, per_page: 20 }),
    enabled: !!slug,
  });

  const category = categories?.find((c) => c.slug === slug);

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
      <View className="px-4 py-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-3">
          <FontAwesome name="arrow-left" size={22} color="#2B2622" />
        </Pressable>
        <Text className="font-heading text-xl text-stone-charcoal">
          {category?.name ?? 'Category'}
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#C8530A" />
        </View>
      ) : (
        <FlatList
          data={activitiesPage?.data ?? []}
          renderItem={({ item }) => <ActivityCardItem activity={item} currency={currency} />}
          keyExtractor={(item) => `activity-${item.id}`}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          ListEmptyComponent={
            <View className="py-12 items-center">
              <Text className="font-body text-stone-gray">
                No tours found in this category.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
