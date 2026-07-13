import { useLocalSearchParams, router } from 'expo-router';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { createBooking } from '@/lib/bookingApi';
import { formatPrice } from '@/lib/formatCurrency';
import { useSettingsStore } from '@/stores/settingsStore';

export default function BookingCheckoutScreen() {
  const {
    slug,
    title,
    basePrice,
    duration,
    maxGroup,
    timeSlotId,
    date,
    startTime,
    travelers,
    total,
    specialRequests,
  } = useLocalSearchParams<{
    slug: string;
    title: string;
    basePrice: string;
    duration: string;
    maxGroup: string;
    timeSlotId: string;
    date: string;
    startTime: string;
    travelers: string;
    total: string;
    specialRequests: string;
  }>();

  const currency = useSettingsStore((state) => state.currency);
  const [agreed, setAgreed] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: createBooking,
    onSuccess: (data) => {
      router.replace({
        pathname: '/(tabs)/bookings',
      });
      Alert.alert(
        'Booking created',
        `Reference: ${data.booking_ref}\nComplete payment before ${new Date(data.expires_at).toLocaleTimeString()}.`
      );
    },
    onError: (error: Error) => {
      Alert.alert('Booking failed', error.message ?? 'Please try again.');
    },
  });

  const handleConfirm = () => {
    if (!agreed) {
      Alert.alert('Please agree to the terms');
      return;
    }

    mutate({
      time_slot_id: parseInt(timeSlotId ?? '0', 10),
      traveler_count: parseInt(travelers ?? '1', 10),
      currency,
      special_requests: specialRequests || undefined,
    });
  };

  const numericTravelers = parseInt(travelers ?? '1', 10);
  const numericTotal = parseFloat(total ?? '0');

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
      <View className="px-5 py-4 border-b border-stone-gray/10 bg-white">
        <Pressable onPress={() => router.back()} className="mb-3">
          <FontAwesome name="arrow-left" size={20} color="#2B2622" />
        </Pressable>
        <Text className="font-heading text-xl text-stone-charcoal">Checkout</Text>
        <Text className="font-body text-stone-gray text-sm mt-1">{title}</Text>
      </View>

      <ScrollView className="flex-1 px-5 py-4">
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <Text className="font-heading text-base text-stone-charcoal mb-3">Booking summary</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="font-body text-stone-gray">Date</Text>
            <Text className="font-body text-stone-charcoal">
              {new Date(date).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="font-body text-stone-gray">Time</Text>
            <Text className="font-body text-stone-charcoal">{startTime}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="font-body text-stone-gray">Travelers</Text>
            <Text className="font-body text-stone-charcoal">{numericTravelers}</Text>
          </View>
          {specialRequests ? (
            <View className="mb-2">
              <Text className="font-body text-stone-gray">Special requests</Text>
              <Text className="font-body text-stone-charcoal mt-1">{specialRequests}</Text>
            </View>
          ) : null}
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <Text className="font-heading text-base text-stone-charcoal mb-2">Price breakdown</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="font-body text-stone-gray">
              {formatPrice(basePrice ?? '0', currency)} × {numericTravelers}
            </Text>
            <Text className="font-body text-stone-charcoal">{formatPrice(String(numericTotal), currency)}</Text>
          </View>
          <View className="h-px bg-stone-gray/20 my-2" />
          <View className="flex-row justify-between">
            <Text className="font-heading text-stone-charcoal">Total</Text>
            <Text className="font-heading text-xl text-angkor-orange">
              {formatPrice(String(numericTotal), currency)}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setAgreed((v) => !v)}
          className="flex-row items-start mb-4"
        >
          <View
            className={`w-5 h-5 rounded border mr-3 mt-0.5 items-center justify-center ${
              agreed ? 'bg-angkor-orange border-angkor-orange' : 'border-stone-gray bg-white'
            }`}
          >
            {agreed && <FontAwesome name="check" size={12} color="#FFFFFF" />}
          </View>
          <Text className="font-body text-stone-gray text-sm flex-1">
            I agree to the booking terms, cancellation policy, and provider guidelines.
          </Text>
        </Pressable>
      </ScrollView>

      <View className="bg-white border-t border-stone-gray/20 p-4">
        <Pressable
          onPress={handleConfirm}
          disabled={isPending || !agreed}
          className={`rounded-xl py-3 items-center ${
            isPending || !agreed ? 'bg-stone-gray/30' : 'bg-angkor-orange active:bg-angkor-orange-dark'
          }`}
        >
          {isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-body text-white font-semibold text-base">Confirm booking</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
