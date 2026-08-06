import { useLocalSearchParams, router } from 'expo-router';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { fetchTicket, sendConfirmationEmail } from '@/lib/bookingApi';
import { saveImageToGallery, saveQrCodeToGallery } from '@/lib/saveImage';
import { ImageWithFallback } from '@/components/ImageWithFallback';

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function BookingConfirmationScreen() {
  const { bookingId, bookingRef, heroImage } = useLocalSearchParams<{
    bookingId: string;
    bookingRef: string;
    heroImage?: string;
  }>();

  const numericBookingId = parseInt(bookingId ?? '0', 10);

  const {
    data: ticket,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['ticket', numericBookingId],
    queryFn: () => fetchTicket(numericBookingId),
    enabled: numericBookingId > 0,
  });

  const emailMutation = useMutation({
    mutationFn: () => sendConfirmationEmail(numericBookingId),
    onSuccess: () => {
      Alert.alert('Email sent', 'Your confirmation email is on its way.');
    },
    onError: (error: Error) => {
      Alert.alert('Could not send email', error.message ?? 'Please try again.');
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg justify-center items-center">
        <ActivityIndicator color="#000C3B" />
      </SafeAreaView>
    );
  }

  if (error || !ticket) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg px-5 py-6">
        <Pressable onPress={() => router.back()} className="mb-4 w-10 h-10 items-center justify-center -ml-2">
          <FontAwesome name="arrow-left" size={20} color="#000C3B" />
        </Pressable>
        <Text className="font-heading text-2xl text-gyg-text mb-2">Booking Confirmation</Text>
        <Text className="font-body text-gyg-muted">Could not load your ticket.{error ? ` ${error.message}` : ''}</Text>
      </SafeAreaView>
    );
  }

  const isConfirmed = ticket.booking_status === 'confirmed';

  return (
    <SafeAreaView className="flex-1 bg-gyg-bg">
      <View className="px-5 pt-4 pb-3 bg-white border-b border-gyg-border">
        <Pressable
          onPress={() => router.replace('/(tabs)/bookings')}
          className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-gyg-bg"
        >
          <FontAwesome name="arrow-left" size={20} color="#000C3B" />
        </Pressable>
        <Text className="font-heading text-2xl text-gyg-text mt-2">Booking Confirmed</Text>
        <Text className="font-body text-gyg-muted text-sm mt-1">Ref: {bookingRef ?? ticket.booking_ref}</Text>
      </View>

      <ScrollView className="flex-1 px-5 py-6">
        {/* Success header */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-emerald-100 items-center justify-center mb-3">
            <FontAwesome name="check" size={36} color="#059669" />
          </View>
          <Text className="font-heading text-xl text-gyg-text text-center">You're all set!</Text>
          <Text className="font-body text-gyg-muted text-center mt-1 px-8">
            Show this e-ticket or QR code to your provider on the day of your experience.
          </Text>
        </View>

        {!isConfirmed && (
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <View className="flex-row items-start">
              <FontAwesome name="info-circle" size={16} color="#B45309" className="mt-0.5" />
              <Text className="font-body text-amber-900 text-sm ml-2 flex-1">
                Payment is still pending. Your provisional ticket is shown below; the final e-ticket will be issued once payment is complete.
              </Text>
            </View>
          </View>
        )}

        {/* E-ticket card */}
        <View className="bg-white rounded-2xl shadow-card overflow-hidden mb-4">
          <ImageWithFallback
            uri={heroImage}
            containerClassName="h-36 w-full bg-gyg-light"
            className="h-36 w-full"
            onLongPress={() => saveImageToGallery(heroImage)}
          />
          <View className="p-5 items-center">
            <Text className="font-heading text-base text-gyg-text mb-1">Your e-ticket</Text>
            <Text className="font-body text-gyg-muted text-sm mb-4">Ticket ref: {ticket.ticket_ref}</Text>

            {ticket.qr_data_uri ? (
              <Image
                source={{ uri: ticket.qr_data_uri }}
                className="w-56 h-56 mb-3"
                resizeMode="contain"
              />
            ) : (
              <View className="w-56 h-56 bg-gyg-light rounded-xl mb-3 items-center justify-center">
                <FontAwesome name="qrcode" size={48} color="#9CA3AF" />
                <Text className="font-body text-gyg-muted mt-2">QR unavailable</Text>
              </View>
            )}

            {ticket.qr_data_uri && (
              <Pressable
                onPress={() => saveQrCodeToGallery(ticket.qr_data_uri)}
                className="flex-row items-center bg-gyg-bg rounded-full px-4 py-2 mb-4 active:opacity-80"
              >
                <FontAwesome name="download" size={14} color="#000C3B" />
                <Text className="font-body text-gyg-navy text-sm font-semibold ml-2">Save QR to gallery</Text>
              </Pressable>
            )}
          </View>

          <View className="border-t border-dashed border-gyg-border mx-5" />

          <View className="p-5">
            <DetailRow label="Tour" value={ticket.activity} />
            <DetailRow label="Provider" value={ticket.provider} />
            <DetailRow label="Date" value={formatDate(ticket.date)} />
            <DetailRow label="Time" value={ticket.time} />
            <DetailRow label="Travelers" value={String(ticket.travelers)} />
            <DetailRow
              label="Total"
              value={`${ticket.total_price} ${ticket.currency}`}
              last
              highlighted
            />
          </View>
        </View>

        {/* Email confirmation */}
        <Pressable
          onPress={() => emailMutation.mutate()}
          disabled={emailMutation.isPending}
          className="bg-white rounded-xl p-4 shadow-card flex-row items-center justify-center mb-4 active:bg-gyg-bg"
        >
          {emailMutation.isPending ? (
            <ActivityIndicator color="#000C3B" />
          ) : (
            <>
              <FontAwesome name="envelope-o" size={18} color="#000C3B" />
              <Text className="font-body text-gyg-navy font-semibold ml-2">Email confirmation</Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      <View className="bg-white border-t border-gyg-border p-4">
        <Pressable
          onPress={() => router.replace('/(tabs)/bookings')}
          className="rounded-xl py-4 items-center bg-gyg-navy active:bg-black"
        >
          <Text className="font-body text-white font-semibold text-base">View my bookings</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  last,
  highlighted,
}: {
  label: string;
  value: string;
  last?: boolean;
  highlighted?: boolean;
}) {
  return (
    <View className={`flex-row justify-between ${last ? '' : 'mb-3'}`}>
      <Text className="font-body text-gyg-muted">{label}</Text>
      <Text
        className={`font-body text-gyg-text text-right flex-1 ml-4 ${
          highlighted ? 'font-semibold text-gyg-navy' : ''
        }`}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}
