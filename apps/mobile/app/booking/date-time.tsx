import { useLocalSearchParams, router } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { fetchAvailability, AvailabilitySlot, AvailabilityDate } from '@/lib/bookingApi';
import { formatPrice } from '@/lib/formatCurrency';
import { useSettingsStore } from '@/stores/settingsStore';

export default function BookingDateTimeScreen() {
  const { slug, title, basePrice, duration, maxGroup } = useLocalSearchParams<{
    slug: string;
    title: string;
    basePrice: string;
    duration: string;
    maxGroup: string;
  }>();

  const currency = useSettingsStore((state) => state.currency);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const { data, isLoading, error } = useQuery({
    queryKey: ['availability', slug, today, thirtyDaysFromNow],
    queryFn: () => fetchAvailability(slug, undefined, today, thirtyDaysFromNow),
    enabled: !!slug,
  });

  const handleContinue = () => {
    if (!selectedSlot) return;

    router.push({
      pathname: '/booking/travelers',
      params: {
        slug,
        title,
        basePrice,
        duration,
        maxGroup,
        timeSlotId: String(selectedSlot.id),
        date: selectedDate ?? '',
        startTime: selectedSlot.start_time,
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center">
        <ActivityIndicator color="#C8530A" />
      </SafeAreaView>
    );
  }

  if (error || !data || data.dates.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg px-5 py-6">
        <Pressable onPress={() => router.back()} className="mb-4">
          <FontAwesome name="arrow-left" size={20} color="#2B2622" />
        </Pressable>
        <Text className="font-heading text-xl text-stone-charcoal mb-2">Select Date & Time</Text>
        <Text className="font-body text-stone-gray">
          {error ? 'Could not load availability.' : 'No available dates for this tour right now.'}
        </Text>
      </SafeAreaView>
    );
  }

  const datesWithSlots = data.dates.filter((d: AvailabilityDate) => d.slots.length > 0);

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
      <View className="px-5 py-4 border-b border-stone-gray/10 bg-white">
        <Pressable onPress={() => router.back()} className="mb-3">
          <FontAwesome name="arrow-left" size={20} color="#2B2622" />
        </Pressable>
        <Text className="font-heading text-xl text-stone-charcoal">Select Date & Time</Text>
        <Text className="font-body text-stone-gray text-sm mt-1">{title}</Text>
      </View>

      <ScrollView className="flex-1 px-5 py-4">
        {datesWithSlots.map((dateItem: AvailabilityDate) => {
          const isDateSelected = selectedDate === dateItem.date;

          return (
            <View key={dateItem.date} className="mb-6">
              <Pressable
                onPress={() => {
                  setSelectedDate(isDateSelected ? null : dateItem.date);
                  setSelectedSlot(null);
                }}
                className={`rounded-xl px-4 py-3 mb-3 ${
                  isDateSelected ? 'bg-angkor-orange' : 'bg-white'
                }`}
              >
                <Text
                  className={`font-heading text-base ${
                    isDateSelected ? 'text-white' : 'text-stone-charcoal'
                  }`}
                >
                  {new Date(dateItem.date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </Pressable>

              {isDateSelected && (
                <View className="flex-row flex-wrap gap-3">
                  {dateItem.slots.map((slot: AvailabilitySlot) => {
                    const isSlotSelected = selectedSlot?.id === slot.id;
                    const disabled = slot.remaining === 0;

                    return (
                      <Pressable
                        key={slot.id}
                        disabled={disabled}
                        onPress={() => setSelectedSlot(isSlotSelected ? null : slot)}
                        className={`rounded-xl px-4 py-3 min-w-[140px] ${
                          disabled
                            ? 'bg-stone-gray/20'
                            : isSlotSelected
                              ? 'bg-angkor-orange'
                              : 'bg-white'
                        }`}
                      >
                        <Text
                          className={`font-body font-semibold ${
                            disabled
                              ? 'text-stone-gray/50'
                              : isSlotSelected
                                ? 'text-white'
                                : 'text-stone-charcoal'
                          }`}
                        >
                          {slot.start_time}
                          {slot.end_time ? ` - ${slot.end_time}` : ''}
                        </Text>
                        <Text
                          className={`font-body text-xs mt-1 ${
                            disabled
                              ? 'text-stone-gray/40'
                              : isSlotSelected
                                ? 'text-white/80'
                                : 'text-stone-gray'
                          }`}
                        >
                          {slot.remaining} left
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View className="bg-white border-t border-stone-gray/20 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="font-body text-stone-gray text-sm">From</Text>
            <Text className="font-heading text-xl text-angkor-orange">
              {formatPrice(basePrice ?? '0', currency)}
            </Text>
          </View>
          <Text className="font-body text-stone-gray text-sm">per person</Text>
        </View>

        <Pressable
          onPress={handleContinue}
          disabled={!selectedSlot}
          className={`rounded-xl py-3 items-center ${
            selectedSlot ? 'bg-angkor-orange active:bg-angkor-orange-dark' : 'bg-stone-gray/30'
          }`}
        >
          <Text className="font-body text-white font-semibold text-base">Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
