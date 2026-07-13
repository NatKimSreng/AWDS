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

export default function BookingConfirmationScreen() {
  const { bookingId, bookingRef } = useLocalSearchParams<{
    bookingId: string;
    bookingRef: string;
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
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center">
        <ActivityIndicator color="#C8530A" />
      </SafeAreaView>
    );
  }

  if (error || !ticket) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg px-5 py-6">
        <Pressable onPress={() => router.back()} className="mb-4">
          <FontAwesome name="arrow-left" size={20} color="#2B2622" />
        </Pressable>
        <Text className="font-heading text-xl text-stone-charcoal mb-2">Booking Confirmation</Text>
        <Text className="font-body text-stone-gray">Could not load your ticket.{error ? ` ${error.message}` : ''}</Text>
      </SafeAreaView>
    );
  }

  const isConfirmed = ticket.booking_status === 'confirmed';

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
      <View className="px-5 py-4 border-b border-stone-gray/10 bg-white">
        <Pressable onPress={() => router.replace('/(tabs)/bookings')} className="mb-3">
          <FontAwesome name="arrow-left" size={20} color="#2B2622" />
        </Pressable>
        <Text className="font-heading text-xl text-stone-charcoal">Booking Confirmed</Text>
        <Text className="font-body text-stone-gray text-sm mt-1">Ref: {bookingRef ?? ticket.booking_ref}</Text>
      </View>

      <ScrollView className="flex-1 px-5 py-6">
        {!isConfirmed && (
          <View className="bg-khmer-gold/10 border border-khmer-gold/30 rounded-xl p-4 mb-4">
            <Text className="font-body text-stone-charcoal text-sm">
              Payment is still pending. Your provisional ticket is shown below; the final e-ticket will be issued once payment is complete.
            </Text>
          </View>
        )}

        <View className="bg-white rounded-2xl p-5 shadow-sm items-center mb-4">
          <Text className="font-heading text-lg text-stone-charcoal mb-4">Your e-ticket</Text>
          {ticket.qr_data_uri ? (
            <Image
              source={{ uri: ticket.qr_data_uri }}
              className="w-64 h-64 mb-4"
              resizeMode="contain"
            />
          ) : (
            <View className="w-64 h-64 bg-stone-gray/20 rounded-xl mb-4 items-center justify-center">
              <Text className="font-body text-stone-gray">QR unavailable</Text>
            </View>
          )}
          <Text className="font-body text-stone-gray text-sm text-center">Ticket ref: {ticket.ticket_ref}</Text>
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <Text className="font-heading text-base text-stone-charcoal mb-3">Trip details</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="font-body text-stone-gray">Tour</Text>
            <Text className="font-body text-stone-charcoal text-right flex-1 ml-4">{ticket.activity}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="font-body text-stone-gray">Provider</Text>
            <Text className="font-body text-stone-charcoal text-right flex-1 ml-4">{ticket.provider}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="font-body text-stone-gray">Date</Text>
            <Text className="font-body text-stone-charcoal">
              {new Date(ticket.date).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="font-body text-stone-gray">Time</Text>
            <Text className="font-body text-stone-charcoal">{ticket.time}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="font-body text-stone-gray">Travelers</Text>
            <Text className="font-body text-stone-charcoal">{ticket.travelers}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="font-body text-stone-gray">Total</Text>
            <Text className="font-body text-stone-charcoal font-semibold">
              {ticket.total_price} {ticket.currency}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => emailMutation.mutate()}
          disabled={emailMutation.isPending}
          className="bg-white rounded-xl p-4 shadow-sm flex-row items-center justify-center mb-4 active:bg-stone-gray/5"
        >
          {emailMutation.isPending ? (
            <ActivityIndicator color="#C8530A" />
          ) : (
            <>
              <FontAwesome name="envelope-o" size={18} color="#C8530A" className="mr-2" />
              <Text className="font-body text-angkor-orange font-semibold ml-2">Email confirmation</Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      <View className="bg-white border-t border-stone-gray/20 p-4">
        <Pressable
          onPress={() => router.replace('/(tabs)/bookings')}
          className="rounded-xl py-3 items-center bg-angkor-orange active:bg-angkor-orange-dark"
        >
          <Text className="font-body text-white font-semibold text-base">Done</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
