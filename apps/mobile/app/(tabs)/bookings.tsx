import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { fetchMyBookings, BookingListItem, MyBookingsResponse } from '@/lib/bookingApi';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-stone-200 text-stone-700',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-blue-100 text-blue-800',
};

function BookingCard({ booking }: { booking: BookingListItem }) {
  const router = useRouter();
  const badgeStyle = statusStyles[booking.status] ?? 'bg-stone-100 text-stone-600';
  const [bgClass, textClass] = badgeStyle.split(' ');

  const formattedDate = booking.booking_date
    ? new Date(booking.booking_date).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/booking/${booking.id}` as never)}
      className="bg-card-white rounded-xl p-4 mb-3 shadow-sm border border-stone-gray/10"
    >
      <View className="flex-row items-start gap-3">
        {booking.activity?.hero_image?.image_url ? (
          <Image
            source={{ uri: booking.activity.hero_image.image_url }}
            className="w-16 h-16 rounded-lg bg-sand-bg"
            resizeMode="cover"
          />
        ) : (
          <View className="w-16 h-16 rounded-lg bg-sand-bg items-center justify-center">
            <Text className="text-angkor-orange text-xl">🎫</Text>
          </View>
        )}

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-xs text-stone-gray uppercase tracking-wide">
              {booking.booking_ref}
            </Text>
            <View className={`px-2 py-0.5 rounded-full ${bgClass}`}>
              <Text className={`text-xs font-medium capitalize ${textClass}`}>
                {booking.status}
              </Text>
            </View>
          </View>

          <Text className="font-heading text-base text-stone-charcoal mb-1" numberOfLines={2}>
            {booking.activity?.title ?? 'Unknown activity'}
          </Text>

          <Text className="font-body text-sm text-stone-gray">
            {formattedDate}
            {booking.booking_time ? ` • ${booking.booking_time}` : ''}
            {' • '}
            {booking.traveler_count} traveler{booking.traveler_count === 1 ? '' : 's'}
          </Text>

          <Text className="font-body text-sm text-stone-charcoal mt-1">
            ${booking.total_price} {booking.currency}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function BookingsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<MyBookingsResponse>({
    queryKey: ['my-bookings'],
    queryFn: () => fetchMyBookings(1),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center">
        <ActivityIndicator size="large" color="#C8530A" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center px-6">
        <Text className="font-heading text-xl text-stone-charcoal mb-2">
          Could not load bookings
        </Text>
        <Text className="font-body text-stone-gray text-center mb-4">
          {error instanceof Error ? error.message : 'Something went wrong.'}
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="bg-angkor-orange px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Try again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const bookings = data?.data ?? [];

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
      <View className="px-4 pt-4 pb-2">
        <Text className="font-heading text-2xl text-stone-charcoal">My Bookings</Text>
        <Text className="font-body text-stone-gray">
          Tap a booking to view details or cancel.
        </Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <BookingCard booking={item} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C8530A" />
        }
        ListEmptyComponent={
          <View className="py-12 items-center">
            <Text className="text-4xl mb-3">🎒</Text>
            <Text className="font-heading text-lg text-stone-charcoal mb-1">
              No bookings yet
            </Text>
            <Text className="font-body text-stone-gray text-center px-8">
              Explore tours and book your next Angkor adventure.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/')}
              className="mt-4 bg-angkor-orange px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Explore tours</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}
