import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import {
  fetchBooking,
  fetchCancellationPreview,
  cancelBooking,
  BookingListItem,
  CancellationPreviewResponse,
} from '@/lib/bookingApi';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-stone-200 text-stone-700',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-blue-100 text-blue-800',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="bg-card-white rounded-xl p-4 mb-3 shadow-sm border border-stone-gray/10">
      <Text className="text-xs uppercase tracking-wide text-stone-gray mb-2">{title}</Text>
      {children}
    </View>
  );
}

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const bookingId = Number(id);

  const [preview, setPreview] = useState<CancellationPreviewResponse | null>(null);
  const [checkingPreview, setCheckingPreview] = useState(false);

  const { data, isLoading, error } = useQuery<{ data: BookingListItem }>({
    queryKey: ['booking', bookingId],
    queryFn: () => fetchBooking(bookingId),
    enabled: !Number.isNaN(bookingId),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      Alert.alert('Cancelled', 'Your booking has been cancelled.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Cancellation failed.';
      Alert.alert('Could not cancel', message);
    },
  });

  async function handleCancelPress() {
    try {
      setCheckingPreview(true);
      const previewData = await fetchCancellationPreview(bookingId);
      setPreview(previewData);
      setCheckingPreview(false);

      if (!previewData.can_cancel) {
        Alert.alert('Cannot cancel', previewData.message);
        return;
      }

      const refundText = previewData.refund_eligible
        ? `You will receive a full refund of $${previewData.refund_amount}.`
        : 'This cancellation is non-refundable.';

      Alert.alert(
        'Cancel booking?',
        `${previewData.message}\n\n${refundText}`,
        [
          { text: 'Keep booking', style: 'cancel' },
          {
            text: 'Cancel booking',
            style: 'destructive',
            onPress: () => cancelMutation.mutate(),
          },
        ]
      );
    } catch (err: unknown) {
      setCheckingPreview(false);
      const message = err instanceof Error ? err.message : 'Unable to check cancellation policy.';
      Alert.alert('Error', message);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center">
        <ActivityIndicator size="large" color="#C8530A" />
      </SafeAreaView>
    );
  }

  if (error || !data?.data) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center px-6">
        <Text className="font-heading text-xl text-stone-charcoal mb-2">Booking not found</Text>
        <Text className="font-body text-stone-gray text-center mb-4">
          {error instanceof Error ? error.message : 'We could not load this booking.'}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-angkor-orange px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const booking = data.data;
  const badgeStyle = statusStyles[booking.status] ?? 'bg-stone-100 text-stone-600';
  const [bgClass, textClass] = badgeStyle.split(' ');

  const formattedDate = booking.booking_date
    ? new Date(booking.booking_date).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const showCancelButton = ['pending', 'confirmed'].includes(booking.status);

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="px-4 pt-4 pb-2 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <FontAwesome name="arrow-left" size={20} color="#6B635C" />
        </TouchableOpacity>
        <Text className="font-heading text-xl text-stone-charcoal ml-2">Booking details</Text>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-xs text-stone-gray uppercase tracking-wide">{booking.booking_ref}</Text>
            <Text className="font-heading text-2xl text-stone-charcoal mt-1">
              {booking.activity?.title ?? 'Unknown activity'}
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${bgClass}`}>
            <Text className={`text-sm font-medium capitalize ${textClass}`}>{booking.status}</Text>
          </View>
        </View>

        <Section title="When">
          <Text className="font-body text-stone-charcoal">
            {formattedDate ?? 'Date not set'}
          </Text>
          <Text className="font-body text-stone-gray">
            {booking.booking_time ? `Start time: ${booking.booking_time}` : ''}
          </Text>
        </Section>

        <Section title="Travelers">
          <Text className="font-body text-stone-charcoal">
            {booking.traveler_count} traveler{booking.traveler_count === 1 ? '' : 's'}
          </Text>
        </Section>

        <Section title="Total paid">
          <Text className="font-heading text-xl text-stone-charcoal">
            ${booking.total_price} {booking.currency}
          </Text>
        </Section>

        {preview?.can_cancel && (
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
            <Text className="font-body text-amber-900">
              {preview.refund_eligible
                ? `Full refund of $${preview.refund_amount} available.`
                : 'Cancelling now is non-refundable.'}
            </Text>
          </View>
        )}

        {showCancelButton && (
          <TouchableOpacity
            onPress={handleCancelPress}
            disabled={checkingPreview || cancelMutation.isPending}
            activeOpacity={0.8}
            className={`mt-2 rounded-xl py-4 items-center ${
              checkingPreview || cancelMutation.isPending ? 'bg-stone-300' : 'bg-red-600'
            }`}
          >
            {checkingPreview || cancelMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-heading text-base">Cancel booking</Text>
            )}
          </TouchableOpacity>
        )}

        {booking.status === 'cancelled' && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mt-2">
            <Text className="font-body text-red-900">
              This booking was cancelled on{' '}
              {booking.cancelled_at
                ? new Date(booking.cancelled_at).toLocaleDateString()
                : 'N/A'}
              .
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
