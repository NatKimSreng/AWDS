import { useLocalSearchParams, router } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { fetchAvailability, AvailabilitySlot, AvailabilityDate } from '@/lib/bookingApi';
import { formatPrice } from '@/lib/formatCurrency';
import { useSettingsStore } from '@/stores/settingsStore';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

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
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(new Date()));

  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const rangeEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const { data, isLoading, error } = useQuery({
    queryKey: ['availability', slug, today, thirtyDaysFromNow],
    queryFn: () => fetchAvailability(slug, undefined, today, thirtyDaysFromNow),
    enabled: !!slug,
  });

  const availableMap = useMemo(() => {
    const map = new Map<string, AvailabilityDate>();
    if (!data) return map;
    for (const d of data.dates) {
      if (d.slots.some((s) => s.remaining > 0)) map.set(d.date, d);
    }
    return map;
  }, [data]);

  const todayStr = toDateStr(new Date());
  const minView = startOfMonth(new Date());
  const maxView = startOfMonth(rangeEnd);
  const canPrev = viewMonth > minView;
  const canNext = viewMonth < maxView;

  const cells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: (string | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(toDateStr(new Date(year, month, d)));
    return out;
  }, [viewMonth]);

  const selectedDateItem = selectedDate ? availableMap.get(selectedDate) : undefined;

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
        {/* Month calendar */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <Pressable
              onPress={() => canPrev && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              disabled={!canPrev}
              className="w-9 h-9 rounded-full items-center justify-center"
            >
              <FontAwesome name="chevron-left" size={16} color={canPrev ? '#2B2622' : '#9CA3AF'} />
            </Pressable>
            <Text className="font-heading text-base text-stone-charcoal">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </Text>
            <Pressable
              onPress={() => canNext && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
              disabled={!canNext}
              className="w-9 h-9 rounded-full items-center justify-center"
            >
              <FontAwesome name="chevron-right" size={16} color={canNext ? '#2B2622' : '#9CA3AF'} />
            </Pressable>
          </View>

          <View className="flex-row mb-2">
            {WEEKDAYS.map((d, i) => (
              <View key={i} className="flex-1 items-center">
                <Text className="font-body text-xs text-stone-gray font-medium">{d}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row flex-wrap">
            {cells.map((dateStr, i) => {
              if (!dateStr) return <View key={`b-${i}`} className="w-[14.28%] aspect-square" />;
              const isPast = dateStr < todayStr;
              const dateItem = availableMap.get(dateStr);
              const isAvailable = !!dateItem && !isPast;
              const isSelected = selectedDate === dateStr;

              return (
                <Pressable
                  key={dateStr}
                  onPress={() => {
                    if (!isAvailable) return;
                    setSelectedDate(isSelected ? null : dateStr);
                    setSelectedSlot(null);
                  }}
                  disabled={!isAvailable}
                  className={`w-[14.28%] aspect-square items-center justify-center rounded-lg ${
                    isSelected
                      ? 'bg-angkor-orange'
                      : isAvailable
                        ? 'bg-angkor-orange/15'
                        : ''
                  }`}
                >
                  <Text
                    className={`font-body text-sm ${
                      isSelected
                        ? 'text-white font-bold'
                        : isAvailable
                          ? 'text-angkor-orange font-semibold'
                          : isPast
                            ? 'text-stone-gray/30'
                            : 'text-stone-gray/40'
                    }`}
                  >
                    {Number(dateStr.slice(8))}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row mt-3 pt-3 border-t border-stone-gray/10">
            <View className="flex-row items-center mr-4">
              <View className="w-3 h-3 rounded bg-angkor-orange/15 mr-1.5" />
              <Text className="font-body text-xs text-stone-gray">Available</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded bg-angkor-orange mr-1.5" />
              <Text className="font-body text-xs text-stone-gray">Selected</Text>
            </View>
          </View>
        </View>

        {/* Time slots for selected date */}
        {selectedDateItem && (
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="font-heading text-base text-stone-charcoal mb-3">
              Available start times
            </Text>
            <View className="flex-row flex-wrap">
              {selectedDateItem.slots.map((slot: AvailabilitySlot) => {
                const isSlotSelected = selectedSlot?.id === slot.id;
                const disabled = slot.remaining === 0;

                return (
                  <Pressable
                    key={slot.id}
                    disabled={disabled}
                    onPress={() => setSelectedSlot(isSlotSelected ? null : slot)}
                    className={`rounded-xl px-4 py-3 min-w-[140px] mr-3 mb-3 ${
                      disabled
                        ? 'bg-stone-gray/20'
                        : isSlotSelected
                          ? 'bg-angkor-orange'
                          : 'bg-sand-bg border border-stone-gray/15'
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
          </View>
        )}
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