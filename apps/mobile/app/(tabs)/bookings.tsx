import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';

import { fetchMyBookings, BookingListItem, MyBookingsResponse } from '@/lib/bookingApi';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';

const statusStyles: Record<
  string,
  { bg: string; text: string; icon: React.ComponentProps<typeof FontAwesome>['name']; label: string }
> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-800', icon: 'clock-o', label: 'Pending' },
  confirmed: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: 'check', label: 'Confirmed' },
  completed: { bg: 'bg-gyg-light', text: 'text-gyg-muted', icon: 'flag-checkered', label: 'Completed' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: 'times', label: 'Cancelled' },
  refunded: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'refresh', label: 'Refunded' },
};

function BookingCard({ booking }: { booking: BookingListItem }) {
  const router = useRouter();
  const style = statusStyles[booking.status] ?? {
    bg: 'bg-gyg-light',
    text: 'text-gyg-muted',
    icon: 'question-circle',
    label: booking.status,
  };

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
      className="bg-white rounded-2xl p-4 mb-3 shadow-card border border-gyg-border active:bg-gyg-bg"
    >
      <View className="flex-row items-start gap-3">
        <ImageWithFallback
          uri={booking.activity?.hero_image?.image_url}
          containerClassName="w-16 h-16 rounded-xl bg-gyg-light"
          className="w-16 h-16 rounded-xl"
          resizeMode="cover"
        />

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-xs text-gyg-muted uppercase tracking-wide font-semibold">
              {booking.booking_ref}
            </Text>
            <View className={`px-2.5 py-1 rounded-full flex-row items-center ${style.bg}`}>
              <FontAwesome name={style.icon} size={11} style={{ marginRight: 4 }} color={
                style.text === 'text-amber-800' ? '#92400E' :
                style.text === 'text-emerald-800' ? '#047857' :
                style.text === 'text-red-800' ? '#991B1B' :
                style.text === 'text-blue-800' ? '#1E40AF' : '#6B7280'
              } />
              <Text className={`text-xs font-semibold capitalize ${style.text}`}>{style.label}</Text>
            </View>
          </View>

          <Text className="font-heading text-base text-gyg-text mb-1" numberOfLines={2}>
            {booking.activity?.title ?? 'Unknown activity'}
          </Text>

          <View className="flex-row items-center flex-wrap">
            <FontAwesome name="calendar" size={11} color="#6B7280" />
            <Text className="font-body text-sm text-gyg-muted ml-1.5">
              {formattedDate}
            </Text>
            {booking.booking_time && (
              <>
                <Text className="font-body text-gyg-muted text-sm mx-1">·</Text>
                <Text className="font-body text-sm text-gyg-muted">{booking.booking_time}</Text>
              </>
            )}
            <Text className="font-body text-gyg-muted text-sm mx-1">·</Text>
            <Text className="font-body text-sm text-gyg-muted">
              {booking.traveler_count} traveler{booking.traveler_count === 1 ? '' : 's'}
            </Text>
          </View>

          <Text className="font-body text-sm text-gyg-text font-semibold mt-2">
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
      <SafeAreaView className="flex-1 bg-gyg-bg justify-center items-center">
        <ActivityIndicator size="large" color="#000C3B" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg px-4">
        <View className="pt-4 pb-2">
          <Text className="font-heading text-2xl text-gyg-text">My Bookings</Text>
        </View>
        <ErrorState title="Could not load bookings" error={error} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  const bookings = data?.data ?? [];

  return (
    <SafeAreaView className="flex-1 bg-gyg-bg">
      <View className="px-4 pt-4 pb-2">
        <Text className="font-heading text-2xl text-gyg-text">My Bookings</Text>
        <Text className="font-body text-sm text-gyg-muted">Tap a booking to view details or cancel.</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <BookingCard booking={item} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000C3B" />
        }
        ListEmptyComponent={
          <View className="py-12">
            <EmptyState
              icon="ticket"
              title="No bookings yet"
              subtitle="Explore tours and book your next Cambodia adventure."
              actionLabel="Explore tours"
              onAction={() => router.push('/')}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}
