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

function formatSelectedDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function BookingDateTimeScreen() {
  const { slug, title, basePrice, duration, maxGroup, heroImage } = useLocalSearchParams<{
    slug: string;
    title: string;
    basePrice: string;
    duration: string;
    maxGroup: string;
    heroImage?: string;
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
        heroImage,
        timeSlotId: String(selectedSlot.id),
        date: selectedDate ?? '',
        startTime: selectedSlot.start_time,
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg justify-center items-center">
        <ActivityIndicator color="#000C3B" />
      </SafeAreaView>
    );
  }

  if (error || !data || data.dates.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg px-5 py-6">
        <Pressable onPress={() => router.back()} className="mb-4 w-10 h-10 items-center justify-center -ml-2">
          <FontAwesome name="arrow-left" size={20} color="#000C3B" />
        </Pressable>
        <Text className="font-heading text-2xl text-gyg-text mb-2">Select Date & Time</Text>
        <Text className="font-body text-gyg-muted">
          {error ? 'Could not load availability. Please try again.' : 'No available dates for this tour right now.'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gyg-bg">
      {/* Header */}
      <View className="px-5 pt-4 pb-3 bg-white border-b border-gyg-border">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-gyg-bg">
            <FontAwesome name="arrow-left" size={20} color="#000C3B" />
          </Pressable>
          <View className="ml-2 flex-1">
            <Text className="font-heading text-xl text-gyg-text">Select Date & Time</Text>
            <Text className="font-body text-gyg-muted text-sm" numberOfLines={1}>{title}</Text>
          </View>
        </View>

        {/* Step indicator */}
        <View className="flex-row items-center mt-4">
          <View className="flex-1 h-1 rounded-full bg-gyg-navy" />
          <View className="flex-1 h-1 rounded-full bg-gyg-border ml-1" />
          <View className="flex-1 h-1 rounded-full bg-gyg-border ml-1" />
        </View>
      </View>

      <ScrollView className="flex-1 px-5 py-4">
        {/* Calendar */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-card">
          <View className="flex-row items-center justify-between mb-4">
            <Pressable
              onPress={() => canPrev && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              disabled={!canPrev}
              className="w-9 h-9 rounded-full items-center justify-center bg-gyg-bg active:opacity-70"
            >
              <FontAwesome name="chevron-left" size={16} color={canPrev ? '#000C3B' : '#9CA3AF'} />
            </Pressable>
            <Text className="font-heading text-base text-gyg-text">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </Text>
            <Pressable
              onPress={() => canNext && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
              disabled={!canNext}
              className="w-9 h-9 rounded-full items-center justify-center bg-gyg-bg active:opacity-70"
            >
              <FontAwesome name="chevron-right" size={16} color={canNext ? '#000C3B' : '#9CA3AF'} />
            </Pressable>
          </View>

          <View className="flex-row mb-3">
            {WEEKDAYS.map((d, i) => (
              <View key={i} className="flex-1 items-center">
                <Text className="font-body text-xs text-gyg-muted font-semibold">{d}</Text>
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
                  className={`w-[14.28%] aspect-square items-center justify-center rounded-full mb-1 ${
                    isSelected
                      ? 'bg-gyg-navy'
                      : isAvailable
                        ? 'bg-gyg-blue/10'
                        : ''
                  }`}
                >
                  <Text
                    className={`font-body text-sm ${
                      isSelected
                        ? 'text-white font-bold'
                        : isAvailable
                          ? 'text-gyg-navy font-semibold'
                          : isPast
                            ? 'text-gyg-border'
                            : 'text-gyg-muted/50'
                    }`}
                  >
                    {Number(dateStr.slice(8))}
                  </Text>
                  {isAvailable && !isSelected && (
                    <View className="w-1 h-1 rounded-full bg-gyg-blue mt-0.5" />
                  )}
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row mt-4 pt-3 border-t border-gyg-border">
            <View className="flex-row items-center mr-5">
              <View className="w-3 h-3 rounded-full bg-gyg-blue/10 mr-1.5" />
              <Text className="font-body text-xs text-gyg-muted">Available</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-gyg-navy mr-1.5" />
              <Text className="font-body text-xs text-gyg-muted">Selected</Text>
            </View>
          </View>
        </View>

        {/* Selected date summary */}
        {selectedDate && (
          <View className="bg-gyg-navy rounded-2xl p-4 mb-4 shadow-card">
            <Text className="font-body text-white/70 text-xs uppercase tracking-wide mb-1">Selected date</Text>
            <Text className="font-heading text-lg text-white">{formatSelectedDate(selectedDate)}</Text>
          </View>
        )}

        {/* Time slots */}
        {selectedDateItem && (
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-card">
            <Text className="font-heading text-base text-gyg-text mb-3">Available start times</Text>
            <View className="flex-row flex-wrap">
              {selectedDateItem.slots.map((slot: AvailabilitySlot) => {
                const isSlotSelected = selectedSlot?.id === slot.id;
                const disabled = slot.remaining === 0;

                return (
                  <Pressable
                    key={slot.id}
                    disabled={disabled}
                    onPress={() => setSelectedSlot(isSlotSelected ? null : slot)}
                    className={`rounded-xl px-4 py-3 min-w-[140px] mr-3 mb-3 border ${
                      disabled
                        ? 'bg-gyg-light border-gyg-border'
                        : isSlotSelected
                          ? 'bg-gyg-navy border-gyg-navy'
                          : 'bg-white border-gyg-border active:bg-gyg-bg'
                    }`}
                  >
                    <Text
                      className={`font-body font-semibold ${
                        disabled
                          ? 'text-gyg-muted/50'
                          : isSlotSelected
                            ? 'text-white'
                            : 'text-gyg-text'
                      }`}
                    >
                      {slot.start_time}
                      {slot.end_time ? ` - ${slot.end_time}` : ''}
                    </Text>
                    <Text
                      className={`font-body text-xs mt-1 ${
                        disabled
                          ? 'text-gyg-muted/40'
                          : isSlotSelected
                            ? 'text-white/80'
                            : 'text-gyg-muted'
                      }`}
                    >
                      {slot.remaining} {slot.remaining === 1 ? 'spot' : 'spots'} left
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View className="bg-white border-t border-gyg-border p-4">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="font-body text-gyg-muted text-sm">From</Text>
            <Text className="font-heading text-2xl text-gyg-navy">
              {formatPrice(basePrice ?? '0', currency)}
            </Text>
          </View>
          <Text className="font-body text-gyg-muted text-sm">per person</Text>
        </View>

        <Pressable
          onPress={handleContinue}
          disabled={!selectedSlot}
          className={`rounded-xl py-4 items-center ${
            selectedSlot ? 'bg-gyg-navy active:bg-black' : 'bg-gyg-border'
          }`}
        >
          <Text className="font-body text-white font-semibold text-base">
            {selectedSlot ? 'Continue' : 'Select a time'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
