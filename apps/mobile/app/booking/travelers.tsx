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

export default function BookingTravelersScreen() {
  const {
    slug,
    title,
    basePrice,
    duration,
    maxGroup,
    timeSlotId,
    date,
    startTime,
  } = useLocalSearchParams<{
    slug: string;
    title: string;
    basePrice: string;
    duration: string;
    maxGroup: string;
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
    <SafeAreaView className="flex-1 bg-sand-bg">
      <View className="px-5 py-4 border-b border-stone-gray/10 bg-white">
        <Pressable onPress={() => router.back()} className="mb-3">
          <FontAwesome name="arrow-left" size={20} color="#2B2622" />
        </Pressable>
        <Text className="font-heading text-xl text-stone-charcoal">Travelers</Text>
        <Text className="font-body text-stone-gray text-sm mt-1">{title}</Text>
      </View>

      <ScrollView className="flex-1 px-5 py-4">
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <Text className="font-heading text-base text-stone-charcoal mb-1">
            {new Date(date).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Text className="font-body text-stone-gray">Start time: {startTime}</Text>
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <Text className="font-heading text-base text-stone-charcoal mb-4">Number of travelers</Text>
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => adjustTravelers(-1)}
              disabled={travelers <= 1}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                travelers <= 1 ? 'bg-stone-gray/20' : 'bg-angkor-orange/10'
              }`}
            >
              <FontAwesome name="minus" size={16} color={travelers <= 1 ? '#9CA3AF' : '#C8530A'} />
            </Pressable>
            <Text className="font-heading text-2xl text-stone-charcoal w-16 text-center">{travelers}</Text>
            <Pressable
              onPress={() => adjustTravelers(1)}
              disabled={travelers >= numericMaxGroup}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                travelers >= numericMaxGroup ? 'bg-stone-gray/20' : 'bg-angkor-orange/10'
              }`}
            >
              <FontAwesome name="plus" size={16} color={travelers >= numericMaxGroup ? '#9CA3AF' : '#C8530A'} />
            </Pressable>
          </View>
          <Text className="font-body text-stone-gray text-sm mt-3">
            Maximum group size: {numericMaxGroup}
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <Text className="font-heading text-base text-stone-charcoal mb-2">Special requests</Text>
          <TextInput
            value={specialRequests}
            onChangeText={setSpecialRequests}
            placeholder="Dietary needs, accessibility, pickup location..."
            multiline
            numberOfLines={4}
            className="bg-sand-bg rounded-xl p-3 font-body text-stone-charcoal min-h-[100px]"
            style={{ textAlignVertical: 'top' }}
          />
        </View>
      </ScrollView>

      <View className="bg-white border-t border-stone-gray/20 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="font-body text-stone-gray text-sm">Total</Text>
            <Text className="font-heading text-2xl text-angkor-orange">
              {formatPrice(String(total), currency)}
            </Text>
          </View>
          <Text className="font-body text-stone-gray text-sm">{travelers} traveler{travelers > 1 ? 's' : ''}</Text>
        </View>

        <Pressable
          onPress={handleContinue}
          className="rounded-xl py-3 items-center bg-angkor-orange active:bg-angkor-orange-dark"
        >
          <Text className="font-body text-white font-semibold text-base">Continue to checkout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
