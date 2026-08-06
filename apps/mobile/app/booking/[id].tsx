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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import {
  fetchBooking,
  fetchCancellationPreview,
  cancelBooking,
  BookingListItem,
  CancellationPreviewResponse,
} from '@/lib/bookingApi';
import { createThread } from '@/lib/messageApi';
import { ImageWithFallback } from '@/components/ImageWithFallback';

const statusStyles: Record<
  string,
  { bg: string; text: string; color: string; icon: string; label: string }
> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-800', color: '#92400E', icon: 'clock-o', label: 'Pending' },
  confirmed: { bg: 'bg-emerald-100', text: 'text-emerald-800', color: '#047857', icon: 'check', label: 'Confirmed' },
  completed: { bg: 'bg-gyg-light', text: 'text-gyg-muted', color: '#6B7280', icon: 'flag-checkered', label: 'Completed' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', color: '#991B1B', icon: 'times', label: 'Cancelled' },
  refunded: { bg: 'bg-blue-100', text: 'text-blue-800', color: '#1E40AF', icon: 'refresh', label: 'Refunded' },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-card border border-gyg-border">
      <Text className="text-xs uppercase tracking-wide text-gyg-muted font-semibold mb-2">{title}</Text>
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

  const threadMutation = useMutation({
    mutationFn: () => createThread(bookingId),
    onSuccess: (thread) => {
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
      router.push(`/(tabs)/messages/${thread.id}` as never);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Unable to start conversation.';
      Alert.alert('Error', message);
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
      <SafeAreaView className="flex-1 bg-gyg-bg justify-center items-center">
        <ActivityIndicator size="large" color="#000C3B" />
      </SafeAreaView>
    );
  }

  if (error || !data?.data) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg justify-center items-center px-6">
        <Text className="font-heading text-xl text-gyg-text mb-2">Booking not found</Text>
        <Text className="font-body text-gyg-muted text-center mb-4">
          {error instanceof Error ? error.message : 'We could not load this booking.'}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gyg-navy px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-medium">Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const booking = data.data;
  const style = statusStyles[booking.status] ?? {
    bg: 'bg-gyg-light',
    text: 'text-gyg-muted',
    icon: 'question-circle',
    label: booking.status,
  };

  const formattedDate = booking.booking_date
    ? new Date(booking.booking_date).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const showCancelButton = ['pending', 'confirmed'].includes(booking.status);
  const heroImage = booking.activity?.hero_image?.image_url;

  return (
    <SafeAreaView className="flex-1 bg-gyg-bg">
      <View className="px-4 pt-4 pb-2 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gyg-light">
          <FontAwesome name="arrow-left" size={20} color="#000C3B" />
        </TouchableOpacity>
        <Text className="font-heading text-xl text-gyg-text ml-2">Booking details</Text>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>
        {heroImage && (
          <ImageWithFallback
            uri={heroImage}
            containerClassName="h-44 w-full rounded-2xl bg-gyg-light mb-4 shadow-card"
            className="h-44 w-full rounded-2xl"
          />
        )}

        <View className="bg-white rounded-2xl p-4 mb-4 shadow-card border border-gyg-border">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs text-gyg-muted uppercase tracking-wide font-semibold">{booking.booking_ref}</Text>
            <View className={`px-3 py-1.5 rounded-full flex-row items-center ${style.bg}`}>
              <FontAwesome name={style.icon as any} size={12} style={{ marginRight: 6 }} color={style.color} />
              <Text className={`text-sm font-semibold capitalize ${style.text}`}>{style.label}</Text>
            </View>
          </View>

          <Text className="font-heading text-2xl text-gyg-text">
            {booking.activity?.title ?? 'Unknown activity'}
          </Text>
        </View>

        <Section title="When">
          <Text className="font-body text-gyg-text">{formattedDate ?? 'Date not set'}</Text>
          {booking.booking_time ? (
            <View className="flex-row items-center mt-1">
              <FontAwesome name="clock-o" size={14} color="#6B7280" />
              <Text className="font-body text-gyg-muted ml-1.5">Start time: {booking.booking_time}</Text>
            </View>
          ) : null}
        </Section>

        <Section title="Travelers">
          <View className="flex-row items-center">
            <FontAwesome name="users" size={14} color="#6B7280" />
            <Text className="font-body text-gyg-text ml-1.5">
              {booking.traveler_count} traveler{booking.traveler_count === 1 ? '' : 's'}
            </Text>
          </View>
        </Section>

        <Section title="Total">
          <Text className="font-heading text-2xl text-gyg-navy">
            ${booking.total_price} {booking.currency}
          </Text>
        </Section>

        {booking.status === 'completed' && (
          <TouchableOpacity
            onPress={() => router.push(`/booking/review/${bookingId}`)}
            activeOpacity={0.8}
            className="bg-gyg-navy rounded-xl py-4 items-center mb-3 shadow-card active:bg-black"
          >
            <View className="flex-row items-center">
              <FontAwesome name="star" size={16} color="#fff" />
              <Text className="text-white font-heading text-base ml-2">Write a review</Text>
            </View>
          </TouchableOpacity>
        )}

        {['confirmed', 'completed'].includes(booking.status) && (
          <TouchableOpacity
            onPress={() => threadMutation.mutate()}
            disabled={threadMutation.isPending}
            activeOpacity={0.8}
            className={`rounded-xl py-4 items-center mb-3 shadow-card ${
              threadMutation.isPending ? 'bg-gyg-border' : 'bg-gyg-text active:bg-black'
            }`}
          >
            {threadMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View className="flex-row items-center">
                <FontAwesome name="comments" size={16} color="#fff" />
                <Text className="text-white font-heading text-base ml-2">Message provider</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

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
              checkingPreview || cancelMutation.isPending ? 'bg-gyg-border' : 'bg-red-600 active:bg-red-700'
            }`}
          >
            {checkingPreview || cancelMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View className="flex-row items-center">
                <FontAwesome name="trash" size={16} color="#fff" />
                <Text className="text-white font-heading text-base ml-2">Cancel booking</Text>
              </View>
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
