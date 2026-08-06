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
import { useAuthStore } from '@/stores/authStore';
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

const PAYMENT_METHODS = [
  {
    key: 'bakong',
    label: 'Bakong KHQR',
    subtitle: 'Scan & pay with any bank app',
    icon: 'qrcode',
  },
];

export default function BookingCheckoutScreen() {
  const {
    slug,
    title,
    basePrice,
    duration,
    maxGroup,
    heroImage,
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
    heroImage?: string;
    timeSlotId: string;
    date: string;
    startTime: string;
    travelers: string;
    total: string;
    specialRequests: string;
  }>();

  const currency = useSettingsStore((state) => state.currency);
  const user = useAuthStore((state) => state.user);
  const [agreed, setAgreed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bakong');

  const { mutate, isPending } = useMutation({
    mutationFn: createBooking,
    onSuccess: (data) => {
      router.replace({
        pathname: '/booking/confirmation' as never,
        params: {
          bookingId: String(data.id),
          bookingRef: data.booking_ref,
          heroImage,
        },
      });
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
    <SafeAreaView className="flex-1 bg-gyg-bg">
      {/* Header */}
      <View className="px-5 pt-4 pb-3 bg-white border-b border-gyg-border">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-gyg-bg">
            <FontAwesome name="arrow-left" size={20} color="#000C3B" />
          </Pressable>
          <View className="ml-2 flex-1">
            <Text className="font-heading text-xl text-gyg-text">Checkout</Text>
            <Text className="font-body text-gyg-muted text-sm" numberOfLines={1}>{title}</Text>
          </View>
        </View>

        <View className="flex-row items-center mt-4">
          <View className="flex-1 h-1 rounded-full bg-gyg-navy" />
          <View className="flex-1 h-1 rounded-full bg-gyg-navy ml-1" />
          <View className="flex-1 h-1 rounded-full bg-gyg-navy ml-1" />
        </View>
      </View>

      <ScrollView className="flex-1 px-5 py-4">
        {/* Tour summary */}
        <View className="bg-white rounded-2xl p-4 shadow-card mb-4">
          <View className="flex-row">
            <ImageWithFallback
              uri={heroImage}
              containerClassName="w-20 h-20 rounded-xl bg-gyg-light mr-4"
              className="w-20 h-20 rounded-xl"
            />
            <View className="flex-1">
              <Text className="font-heading text-base text-gyg-text" numberOfLines={2}>{title}</Text>
              <View className="flex-row items-center mt-1">
                <FontAwesome name="calendar" size={12} color="#6B7280" />
                <Text className="font-body text-gyg-muted text-sm ml-1.5">{formatDate(date)} · {startTime}</Text>
              </View>
              <Text className="font-body text-gyg-muted text-sm mt-1">
                {numericTravelers} traveler{numericTravelers > 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {specialRequests ? (
            <View className="mt-4 pt-3 border-t border-gyg-border">
              <Text className="font-body text-gyg-muted text-sm mb-1">Special requests</Text>
              <Text className="font-body text-gyg-text">{specialRequests}</Text>
            </View>
          ) : null}
        </View>

        {/* Price breakdown */}
        <View className="bg-white rounded-2xl p-5 shadow-card mb-4">
          <Text className="font-heading text-base text-gyg-text mb-3">Price breakdown</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="font-body text-gyg-muted">
              {formatPrice(basePrice ?? '0', currency)} × {numericTravelers}
            </Text>
            <Text className="font-body text-gyg-text">{formatPrice(String(numericTotal), currency)}</Text>
          </View>
          <View className="h-px bg-gyg-border my-3" />
          <View className="flex-row justify-between items-center">
            <Text className="font-heading text-gyg-text">Total</Text>
            <Text className="font-heading text-2xl text-gyg-navy">
              {formatPrice(String(numericTotal), currency)}
            </Text>
          </View>
        </View>

        {/* Lead traveler */}
        <View className="bg-white rounded-2xl p-5 shadow-card mb-4">
          <Text className="font-heading text-base text-gyg-text mb-3">Lead traveler</Text>
          {user ? (
            <View>
              <View className="flex-row items-center mb-2">
                <FontAwesome name="user" size={14} color="#000C3B" />
                <Text className="font-body text-gyg-text ml-2">{user.name}</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <FontAwesome name="envelope" size={14} color="#6B7280" />
                <Text className="font-body text-gyg-muted ml-2">{user.email}</Text>
              </View>
              {user.phone && (
                <View className="flex-row items-center">
                  <FontAwesome name="phone" size={14} color="#6B7280" />
                  <Text className="font-body text-gyg-muted ml-2">{user.phone}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text className="font-body text-gyg-muted">Log in to pre-fill your details.</Text>
          )}
        </View>

        {/* Payment method */}
        <View className="bg-white rounded-2xl p-5 shadow-card mb-4">
          <Text className="font-heading text-base text-gyg-text mb-3">Payment method</Text>
          {PAYMENT_METHODS.map((method) => (
            <Pressable
              key={method.key}
              onPress={() => setPaymentMethod(method.key)}
              className={`flex-row items-center p-3 rounded-xl border mb-2 last:mb-0 ${
                paymentMethod === method.key ? 'bg-gyg-bg border-gyg-navy' : 'bg-white border-gyg-border'
              }`}
            >
              <View className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gyg-border">
                <FontAwesome name={method.icon as any} size={18} color="#000C3B" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="font-body text-gyg-text font-semibold">{method.label}</Text>
                <Text className="font-body text-gyg-muted text-xs">{method.subtitle}</Text>
              </View>
              <View
                className={`w-5 h-5 rounded-full border items-center justify-center ${
                  paymentMethod === method.key ? 'border-gyg-navy bg-gyg-navy' : 'border-gyg-border'
                }`}
              >
                {paymentMethod === method.key && <FontAwesome name="check" size={12} color="#FFFFFF" />}
              </View>
            </Pressable>
          ))}
          <View className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
            <Text className="font-body text-amber-800 text-xs">
              KHQR payment flow is being set up. Your booking will be created now and the final payment step will appear once ready.
            </Text>
          </View>
        </View>

        {/* Terms */}
        <Pressable
          onPress={() => setAgreed((v) => !v)}
          className="flex-row items-start mb-4"
        >
          <View
            className={`w-5 h-5 rounded border mr-3 mt-0.5 items-center justify-center ${
              agreed ? 'bg-gyg-navy border-gyg-navy' : 'border-gyg-border bg-white'
            }`}
          >
            {agreed && <FontAwesome name="check" size={12} color="#FFFFFF" />}
          </View>
          <Text className="font-body text-gyg-muted text-sm flex-1">
            I agree to the booking terms, cancellation policy, and provider guidelines.
          </Text>
        </Pressable>
      </ScrollView>

      {/* Footer */}
      <View className="bg-white border-t border-gyg-border p-4">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="font-body text-gyg-muted text-sm">Total</Text>
            <Text className="font-heading text-2xl text-gyg-navy">
              {formatPrice(String(numericTotal), currency)}
            </Text>
          </View>
          <Text className="font-body text-gyg-muted text-sm">{numericTravelers} traveler{numericTravelers > 1 ? 's' : ''}</Text>
        </View>

        <Pressable
          onPress={handleConfirm}
          disabled={isPending || !agreed}
          className={`rounded-xl py-4 items-center ${
            isPending || !agreed ? 'bg-gyg-border' : 'bg-gyg-navy active:bg-black'
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
