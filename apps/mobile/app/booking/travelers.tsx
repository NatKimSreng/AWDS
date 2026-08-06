import { useLocalSearchParams, router } from 'expo-router';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { formatPrice } from '@/lib/formatCurrency';
import { useSettingsStore } from '@/stores/settingsStore';

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function BookingTravelersScreen() {
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
  }>();

  const currency = useSettingsStore((state) => state.currency);
  const [travelers, setTravelers] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');

  const numericMaxGroup = Math.min(parseInt(maxGroup ?? '8', 10), 50);
  const pricePerPerson = parseFloat(basePrice ?? '0');
  const total = pricePerPerson * travelers;

  const adjustTravelers = (delta: number) => {
    setTravelers((current) => Math.max(1, Math.min(numericMaxGroup, current + delta)));
  };

  const handleContinue = () => {
    router.push({
      pathname: '/booking/checkout',
      params: {
        slug,
        title,
        basePrice,
        duration,
        maxGroup,
        heroImage,
        timeSlotId,
        date,
        startTime,
        travelers: String(travelers),
        total: String(total),
        specialRequests,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gyg-bg">
      {/* Header */}
      <View className="px-5 pt-4 pb-3 bg-white border-b border-gyg-border">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-gyg-bg">
            <FontAwesome name="arrow-left" size={20} color="#000C3B" />
          </Pressable>
          <View className="ml-2 flex-1">
            <Text className="font-heading text-xl text-gyg-text">Travelers</Text>
            <Text className="font-body text-gyg-muted text-sm" numberOfLines={1}>{title}</Text>
          </View>
        </View>

        <View className="flex-row items-center mt-4">
          <View className="flex-1 h-1 rounded-full bg-gyg-navy" />
          <View className="flex-1 h-1 rounded-full bg-gyg-navy ml-1" />
          <View className="flex-1 h-1 rounded-full bg-gyg-border ml-1" />
        </View>
      </View>

      <ScrollView className="flex-1 px-5 py-4">
        {/* Selected slot summary */}
        <View className="bg-gyg-navy rounded-2xl p-4 mb-4 shadow-card">
          <Text className="font-body text-white/70 text-xs uppercase tracking-wide mb-1">Selected experience</Text>
          <Text className="font-heading text-base text-white" numberOfLines={2}>{title}</Text>
          <View className="flex-row items-center mt-2">
            <FontAwesome name="calendar" size={12} color="rgba(255,255,255,0.7)" />
            <Text className="font-body text-white/80 text-sm ml-2">{formatDate(date)} · {startTime}</Text>
          </View>
        </View>

        {/* Travelers */}
        <View className="bg-white rounded-2xl p-5 shadow-card mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="font-heading text-base text-gyg-text">Number of travelers</Text>
              <Text className="font-body text-gyg-muted text-sm mt-0.5">Max group size: {numericMaxGroup}</Text>
            </View>
            <Text className="font-body text-gyg-navy font-semibold text-sm">
              {formatPrice(basePrice ?? '0', currency)}/person
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => adjustTravelers(-1)}
              disabled={travelers <= 1}
              className={`w-12 h-12 rounded-full items-center justify-center border ${
                travelers <= 1
                  ? 'bg-gyg-light border-gyg-border'
                  : 'bg-white border-gyg-navy active:bg-gyg-bg'
              }`}
            >
              <FontAwesome name="minus" size={16} color={travelers <= 1 ? '#9CA3AF' : '#000C3B'} />
            </Pressable>

            <View className="items-center">
              <Text className="font-heading text-3xl text-gyg-text w-20 text-center">{travelers}</Text>
              <Text className="font-body text-gyg-muted text-xs">{travelers === 1 ? 'Traveler' : 'Travelers'}</Text>
            </View>

            <Pressable
              onPress={() => adjustTravelers(1)}
              disabled={travelers >= numericMaxGroup}
              className={`w-12 h-12 rounded-full items-center justify-center border ${
                travelers >= numericMaxGroup
                  ? 'bg-gyg-light border-gyg-border'
                  : 'bg-white border-gyg-navy active:bg-gyg-bg'
              }`}
            >
              <FontAwesome name="plus" size={16} color={travelers >= numericMaxGroup ? '#9CA3AF' : '#000C3B'} />
            </Pressable>
          </View>
        </View>

        {/* Special requests */}
        <View className="bg-white rounded-2xl p-5 shadow-card mb-4">
          <Text className="font-heading text-base text-gyg-text mb-2">Special requests</Text>
          <Text className="font-body text-gyg-muted text-sm mb-3">
            Dietary needs, accessibility, pickup location, or anything else the provider should know.
          </Text>
          <TextInput
            value={specialRequests}
            onChangeText={setSpecialRequests}
            placeholder="Add your requests..."
            multiline
            numberOfLines={4}
            className="bg-gyg-bg rounded-xl p-3 font-body text-gyg-text min-h-[100px] border border-gyg-border"
            style={{ textAlignVertical: 'top' }}
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="bg-white border-t border-gyg-border p-4">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="font-body text-gyg-muted text-sm">Total</Text>
            <Text className="font-heading text-2xl text-gyg-navy">
              {formatPrice(String(total), currency)}
            </Text>
          </View>
          <Text className="font-body text-gyg-muted text-sm">{travelers} traveler{travelers > 1 ? 's' : ''}</Text>
        </View>

        <Pressable
          onPress={handleContinue}
          className="rounded-xl py-4 items-center bg-gyg-navy active:bg-black"
        >
          <Text className="font-body text-white font-semibold text-base">Continue to checkout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
