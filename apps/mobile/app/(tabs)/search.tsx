import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';

import {
  fetchActivities,
  fetchCategories,
  fetchCities,
  type ActivityCard,
  type Category,
  type City,
  type PaginatedActivities,
} from '@/lib/publicApi';
import { TourCard } from '@/components/TourCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { ConnectionDebug } from '@/components/ConnectionDebug';

const { width } = Dimensions.get('window');
const GRID_GAP = 12;
const CARD_WIDTH = (width - 32 - GRID_GAP) / 2;

const SORTS = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'price_asc', label: 'Price: Low → High' },
  { key: 'price_desc', label: 'Price: High → Low' },
  { key: 'rating', label: 'Top Rated' },
  { key: 'newest', label: 'Newest' },
];

const DURATIONS = [
  { key: 2, label: '≤ 2h', minutes: 120 },
  { key: 4, label: '≤ 4h', minutes: 240 },
  { key: 8, label: '≤ 8h', minutes: 480 },
];

interface FiltersState {
  query: string;
  category?: string;
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  duration?: number;
  instantBook?: boolean;
  sort: 'recommended' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View className="flex-row items-end justify-between mb-3 px-4">
      <Text className="font-heading text-lg text-gyg-text">{title}</Text>
      {action && onAction && (
        <Pressable onPress={onAction}>
          <Text className="font-body text-sm text-gyg-blue font-semibold">{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

function CategoryCircle({ item, onPress, active }: { item: Category; onPress: () => void; active?: boolean }) {
  const icon = (item.icon as React.ComponentProps<typeof FontAwesome>['name']) || 'tag';

  return (
    <Pressable onPress={onPress} className="items-center mr-4 active:opacity-80">
      <View
        className={`w-16 h-16 rounded-full items-center justify-center mb-2 border ${
          active ? 'bg-gyg-navy border-gyg-navy' : 'bg-white border-gyg-border'
        }`}
      >
        <FontAwesome name={icon} size={22} color={active ? '#fff' : '#000C3B'} />
      </View>
      <Text className={`font-body text-xs text-center w-16 ${active ? 'text-gyg-navy font-semibold' : 'text-gyg-text'}`}>
        {item.name}
      </Text>
    </Pressable>
  );
}

function CityCard({ item, onPress }: { item: City; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="w-36 h-28 rounded-2xl overflow-hidden mr-3 active:opacity-90 bg-gyg-navy">
      <View className="absolute inset-0 bg-gradient-to-t from-gyg-navy/90 via-gyg-navy/30 to-transparent" />
      <View className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/20 items-center justify-center">
        <FontAwesome name="map-marker" size={16} color="#fff" />
      </View>
      <View className="absolute bottom-3 left-3 right-3">
        <Text className="font-heading text-white text-base leading-5">{item.name}</Text>
        <Text className="font-body text-white/80 text-xs mt-0.5">
          {item.activities_count ?? 0} tour{(item.activities_count ?? 0) === 1 ? '' : 's'}
        </Text>
      </View>
    </Pressable>
  );
}

function FilterChip({
  label,
  active,
  onPress,
  icon,
  onClear,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
  onClear?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center rounded-full px-3.5 py-2 mr-2 border ${
        active
          ? 'bg-gyg-navy border-gyg-navy shadow-sm'
          : 'bg-white border-gyg-border active:bg-gyg-bg'
      }`}
    >
      {icon && (
        <View className="mr-1.5">
          <FontAwesome name={icon} size={12} color={active ? '#fff' : '#6B7280'} />
        </View>
      )}
      <Text className={`font-body text-sm font-semibold ${active ? 'text-white' : 'text-gyg-text'}`}>
        {label}
      </Text>
      {onClear && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="ml-1.5 w-5 h-5 items-center justify-center rounded-full bg-white/20"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <FontAwesome name="times" size={10} color="#fff" />
        </Pressable>
      )}
    </Pressable>
  );
}

function ActiveFilterChips({
  filters,
  categoryName,
  cityName,
  onChange,
  onOpen,
}: {
  filters: FiltersState;
  categoryName?: string;
  cityName?: string;
  onChange: (filters: FiltersState) => void;
  onOpen: () => void;
}) {
  const chips: React.ReactNode[] = [];

  if (filters.category) {
    chips.push(
      <FilterChip
        key="cat"
        label={categoryName ?? filters.category}
        active
        onClear={() => onChange({ ...filters, category: undefined })}
      />
    );
  }

  if (filters.city) {
    chips.push(
      <FilterChip
        key="city"
        label={cityName ?? filters.city}
        active
        onClear={() => onChange({ ...filters, city: undefined })}
      />
    );
  }

  if (filters.minPrice || filters.maxPrice) {
    const label =
      filters.minPrice && filters.maxPrice
        ? `$${filters.minPrice} - $${filters.maxPrice}`
        : filters.minPrice
          ? `From $${filters.minPrice}`
          : `Up to $${filters.maxPrice}`;
    chips.push(
      <FilterChip
        key="price"
        label={label}
        active
        onClear={() => onChange({ ...filters, minPrice: undefined, maxPrice: undefined })}
      />
    );
  }

  if (filters.duration) {
    const durationLabel = DURATIONS.find((d) => d.key === filters.duration)?.label ?? `≤ ${filters.duration}h`;
    chips.push(
      <FilterChip
        key="duration"
        label={durationLabel}
        active
        onClear={() => onChange({ ...filters, duration: undefined })}
      />
    );
  }

  if (filters.instantBook) {
    chips.push(
      <FilterChip
        key="instant"
        label="Instant Book"
        active
        onClear={() => onChange({ ...filters, instantBook: false })}
      />
    );
  }

  return (
    <View className="flex-row items-center px-4 py-2.5 border-b border-gyg-border bg-white">
      <Pressable
        onPress={onOpen}
        className={`flex-row items-center rounded-full px-3 py-2 border mr-2 ${
          chips.length === 0 ? 'bg-white border-gyg-border active:bg-gyg-bg' : 'bg-gyg-bg border-gyg-border active:bg-gyg-light'
        }`}
      >
        <FontAwesome name="sliders" size={14} color="#000C3B" />
        <Text className="font-body text-sm text-gyg-text font-semibold ml-2">{chips.length > 0 ? 'Filter' : 'Filters'}</Text>
      </Pressable>

      {chips.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
          {chips}
          <Pressable
            onPress={() =>
              onChange({
                query: filters.query,
                sort: filters.sort,
              })
            }
            className="px-2"
          >
            <Text className="font-body text-sm text-gyg-blue font-semibold">Clear all</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

function FilterModal({
  visible,
  filters,
  categories,
  cities,
  onClose,
  onApply,
}: {
  visible: boolean;
  filters: FiltersState;
  categories?: Category[];
  cities?: City[];
  onClose: () => void;
  onApply: (filters: FiltersState) => void;
}) {
  const [draft, setDraft] = useState<FiltersState>(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters, visible]);

  const apply = useCallback(() => {
    onApply(draft);
    onClose();
  }, [draft, onApply, onClose]);

  const clear = useCallback(() => {
    const reset: FiltersState = {
      query: draft.query,
      sort: 'recommended',
    };
    setDraft(reset);
    onApply(reset);
    onClose();
  }, [draft.query, onApply, onClose]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-gyg-navy/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[92%] shadow-2xl overflow-hidden">
          <View className="px-5 pt-5 pb-4 border-b border-gyg-border flex-row items-center justify-between bg-white">
            <View>
              <Text className="font-heading text-xl text-gyg-text">Filters</Text>
              <Text className="font-body text-xs text-gyg-muted mt-0.5">Narrow down your perfect tour</Text>
            </View>
            <Pressable
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-gyg-bg items-center justify-center active:bg-gyg-light"
            >
              <FontAwesome name="times" size={18} color="#1A1A1A" />
            </Pressable>
          </View>

          <ScrollView className="px-5 py-5" keyboardShouldPersistTaps="handled">
            {/* Sort */}
            <View className="mb-6">
              <Text className="font-heading text-base text-gyg-text mb-3">Sort by</Text>
              <View className="flex-row flex-wrap">
                {SORTS.map((sort) => (
                  <Pressable
                    key={sort.key}
                    onPress={() => setDraft({ ...draft, sort: sort.key as FiltersState['sort'] })}
                    className={`rounded-xl px-4 py-2.5 mr-2 mb-2 border ${
                      draft.sort === sort.key
                        ? 'bg-gyg-navy border-gyg-navy'
                        : 'bg-white border-gyg-border active:bg-gyg-bg'
                    }`}
                  >
                    <Text
                      className={`font-body text-sm font-semibold ${
                        draft.sort === sort.key ? 'text-white' : 'text-gyg-text'
                      }`}
                    >
                      {sort.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Categories */}
            {categories && categories.length > 0 && (
              <View className="mb-6">
                <Text className="font-heading text-base text-gyg-text mb-3">Categories</Text>
                <View className="flex-row flex-wrap">
                  {categories.map((cat) => (
                    <Pressable
                      key={cat.id}
                      onPress={() =>
                        setDraft({
                          ...draft,
                          category: draft.category === cat.slug ? undefined : cat.slug,
                        })
                      }
                      className={`rounded-full px-4 py-2 mr-2 mb-2 border ${
                        draft.category === cat.slug
                          ? 'bg-gyg-navy border-gyg-navy'
                          : 'bg-white border-gyg-border active:bg-gyg-bg'
                      }`}
                    >
                      <Text
                        className={`font-body text-sm font-semibold ${
                          draft.category === cat.slug ? 'text-white' : 'text-gyg-text'
                        }`}
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Cities */}
            {cities && cities.length > 0 && (
              <View className="mb-6">
                <Text className="font-heading text-base text-gyg-text mb-3">Destinations</Text>
                <View className="flex-row flex-wrap">
                  {cities.map((city) => (
                    <Pressable
                      key={city.id}
                      onPress={() =>
                        setDraft({
                          ...draft,
                          city: draft.city === city.slug ? undefined : city.slug,
                        })
                      }
                      className={`rounded-full px-4 py-2 mr-2 mb-2 border ${
                        draft.city === city.slug
                          ? 'bg-gyg-navy border-gyg-navy'
                          : 'bg-white border-gyg-border active:bg-gyg-bg'
                      }`}
                    >
                      <Text
                        className={`font-body text-sm font-semibold ${
                          draft.city === city.slug ? 'text-white' : 'text-gyg-text'
                        }`}
                      >
                        {city.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Price range */}
            <View className="mb-6">
              <Text className="font-heading text-base text-gyg-text mb-3">Price range (USD)</Text>
              <View className="flex-row items-center gap-3">
                <TextInput
                  className="flex-1 bg-gyg-bg rounded-xl px-4 py-3 font-body text-gyg-text border border-gyg-border"
                  placeholder="Min"
                  keyboardType="numeric"
                  value={draft.minPrice ?? ''}
                  onChangeText={(text) => setDraft({ ...draft, minPrice: text })}
                />
                <Text className="font-body text-gyg-muted">-</Text>
                <TextInput
                  className="flex-1 bg-gyg-bg rounded-xl px-4 py-3 font-body text-gyg-text border border-gyg-border"
                  placeholder="Max"
                  keyboardType="numeric"
                  value={draft.maxPrice ?? ''}
                  onChangeText={(text) => setDraft({ ...draft, maxPrice: text })}
                />
              </View>
            </View>

            {/* Duration */}
            <View className="mb-6">
              <Text className="font-heading text-base text-gyg-text mb-3">Duration</Text>
              <View className="flex-row flex-wrap">
                {DURATIONS.map((dur) => (
                  <Pressable
                    key={dur.key}
                    onPress={() =>
                      setDraft({
                        ...draft,
                        duration: draft.duration === dur.key ? undefined : dur.key,
                      })
                    }
                    className={`rounded-full px-4 py-2 mr-2 mb-2 border ${
                      draft.duration === dur.key
                        ? 'bg-gyg-navy border-gyg-navy'
                        : 'bg-white border-gyg-border active:bg-gyg-bg'
                    }`}
                  >
                    <Text
                      className={`font-body text-sm font-semibold ${
                        draft.duration === dur.key ? 'text-white' : 'text-gyg-text'
                      }`}
                    >
                      {dur.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Instant book */}
            <View className="mb-10 flex-row items-center justify-between bg-gyg-bg rounded-2xl p-4 border border-gyg-border">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-gyg-navy items-center justify-center mr-3">
                  <FontAwesome name="bolt" size={18} color="#fff" />
                </View>
                <View>
                  <Text className="font-heading text-base text-gyg-text">Instant Book</Text>
                  <Text className="font-body text-xs text-gyg-muted mt-0.5">Only show tours you can book immediately</Text>
                </View>
              </View>
              <Switch
                value={!!draft.instantBook}
                onValueChange={(value) => setDraft({ ...draft, instantBook: value })}
                trackColor={{ false: '#E5E7EB', true: '#000C3B' }}
                thumbColor="#fff"
              />
            </View>
          </ScrollView>

          <View className="px-5 pb-7 pt-3 border-t border-gyg-border bg-white flex-row gap-3">
            <Pressable
              onPress={clear}
              className="flex-1 rounded-2xl py-3.5 border border-gyg-border items-center active:bg-gyg-bg"
            >
              <Text className="font-body text-base font-semibold text-gyg-text">Clear</Text>
            </Pressable>
            <Pressable
              onPress={apply}
              className="flex-[2] rounded-2xl py-3.5 bg-gyg-navy items-center active:bg-gyg-navy/80 shadow-lg shadow-gyg-navy/25"
            >
              <Text className="font-body text-base font-semibold text-white">Show results</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ResultSkeleton() {
  return (
    <View className="px-4 pt-2">
      <View className="w-24 h-5 bg-gyg-light rounded mb-4" />
      <View className="flex-row flex-wrap justify-between">
        <View className="mb-4" style={{ width: CARD_WIDTH }}>
          <View className="h-40 bg-gyg-light rounded-t-2xl" />
          <View className="bg-white rounded-b-2xl p-3 border border-t-0 border-gyg-border">
            <View className="w-3/4 h-4 bg-gyg-light rounded mb-2" />
            <View className="w-1/2 h-3 bg-gyg-light rounded" />
          </View>
        </View>
        <View className="mb-4" style={{ width: CARD_WIDTH }}>
          <View className="h-40 bg-gyg-light rounded-t-2xl" />
          <View className="bg-white rounded-b-2xl p-3 border border-t-0 border-gyg-border">
            <View className="w-3/4 h-4 bg-gyg-light rounded mb-2" />
            <View className="w-1/2 h-3 bg-gyg-light rounded" />
          </View>
        </View>
        <View className="mb-4" style={{ width: CARD_WIDTH }}>
          <View className="h-40 bg-gyg-light rounded-t-2xl" />
          <View className="bg-white rounded-b-2xl p-3 border border-t-0 border-gyg-border">
            <View className="w-3/4 h-4 bg-gyg-light rounded mb-2" />
            <View className="w-1/2 h-3 bg-gyg-light rounded" />
          </View>
        </View>
        <View className="mb-4" style={{ width: CARD_WIDTH }}>
          <View className="h-40 bg-gyg-light rounded-t-2xl" />
          <View className="bg-white rounded-b-2xl p-3 border border-t-0 border-gyg-border">
            <View className="w-3/4 h-4 bg-gyg-light rounded mb-2" />
            <View className="w-1/2 h-3 bg-gyg-light rounded" />
          </View>
        </View>
      </View>
    </View>
  );
}

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string; city?: string; category?: string }>();
  const [filters, setFilters] = useState<FiltersState>(() => ({
    query: params.q ?? '',
    city: params.city ?? undefined,
    category: params.category ?? undefined,
    sort: 'recommended',
  }));
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(true),
    staleTime: 1000 * 60 * 5,
  });

  const { data: cities, isLoading: citiesLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: () => fetchCities(true),
    staleTime: 1000 * 60 * 5,
  });

  const searchFilters = useMemo(
    () => ({
      query: filters.query.length >= 2 ? filters.query : undefined,
      category: filters.category,
      city: filters.city,
      min_price: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
      max_price: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      duration: filters.duration ? filters.duration * 60 : undefined,
      instant_book: filters.instantBook || undefined,
      sort: filters.sort === 'recommended' ? undefined : filters.sort,
      per_page: 50,
    }),
    [filters]
  );

  const {
    data: activitiesPage,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedActivities, Error, PaginatedActivities, readonly [string, string, typeof searchFilters]>({
    queryKey: ['activities', 'search', searchFilters] as const,
    queryFn: () => fetchActivities(searchFilters),
    staleTime: 1000 * 60,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const activities = activitiesPage?.data ?? [];
  const total = activitiesPage?.total ?? 0;
  const isDefaultView =
    !filters.query &&
    !filters.category &&
    !filters.city &&
    !filters.minPrice &&
    !filters.maxPrice &&
    !filters.duration &&
    !filters.instantBook;

  const categoryName = useMemo(
    () => categories?.find((c) => c.slug === filters.category)?.name,
    [categories, filters.category]
  );
  const cityName = useMemo(
    () => cities?.find((c) => c.slug === filters.city)?.name,
    [cities, filters.city]
  );

  return (
    <SafeAreaView className="flex-1 bg-gyg-bg">
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-4 border-b border-gyg-border">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-heading text-2xl text-gyg-text">Search tours</Text>
          <Pressable
            onPress={() => setFilterModalOpen(true)}
            className="w-10 h-10 rounded-full bg-gyg-navy items-center justify-center active:bg-gyg-navy/80 shadow-sm"
          >
            <FontAwesome name="sliders" size={18} color="#fff" />
          </Pressable>
        </View>

        <View className="flex-row items-center bg-gyg-bg rounded-2xl px-4 py-3 border border-gyg-border">
          <FontAwesome name="search" size={18} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 font-body text-gyg-text text-base"
            placeholder="Search by name, place, or activity..."
            placeholderTextColor="#9CA3AF"
            value={filters.query}
            onChangeText={(text) => setFilters((f) => ({ ...f, query: text }))}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {filters.query.length > 0 && (
            <Pressable
              onPress={() => setFilters((f) => ({ ...f, query: '' }))}
              className="w-7 h-7 items-center justify-center rounded-full active:bg-gyg-light"
            >
              <FontAwesome name="times-circle" size={18} color="#6B7280" />
            </Pressable>
          )}
        </View>
      </View>

      <ConnectionDebug />

      <ActiveFilterChips
        filters={filters}
        categoryName={categoryName}
        cityName={cityName}
        onChange={setFilters}
        onOpen={() => setFilterModalOpen(true)}
      />

      {error ? (
        <ErrorState title="Search failed" error={error} onRetry={refetch} />
      ) : isLoading ? (
        <ResultSkeleton />
      ) : activities.length > 0 ? (
        <FlatList
          data={activities}
          numColumns={2}
          keyExtractor={(item) => `activity-${item.id}`}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 }}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: GRID_GAP }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000C3B" />
          }
          ListHeaderComponent={
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-body text-sm text-gyg-muted">
                {total} {total === 1 ? 'tour' : 'tours'} found
              </Text>
              <Pressable
                onPress={() => setFilterModalOpen(true)}
                className="flex-row items-center"
              >
                <FontAwesome name="sort" size={12} color="#6B7280" />
                <Text className="font-body text-xs text-gyg-muted ml-1">
                  {SORTS.find((s) => s.key === filters.sort)?.label}
                </Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }: { item: ActivityCard }) => (
            <View style={{ width: CARD_WIDTH }}>
              <TourCard activity={item} width={CARD_WIDTH} />
            </View>
          )}
        />
      ) : !isDefaultView ? (
        <EmptyState
          icon="search"
          title="No results found"
          subtitle="Try adjusting your filters or search term."
          actionLabel="Clear filters"
          onAction={() =>
            setFilters({
              query: '',
              sort: 'recommended',
            })
          }
        />
      ) : (
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000C3B" />
          }
          keyboardShouldPersistTaps="handled"
        >
          {categories && categories.length > 0 && (
            <View className="mt-4 mb-6">
              <SectionTitle title="Popular categories" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                {categories.slice(0, 8).map((cat) => (
                  <CategoryCircle
                    key={cat.id}
                    item={cat}
                    active={filters.category === cat.slug}
                    onPress={() => setFilters((f) => ({ ...f, category: f.category === cat.slug ? undefined : cat.slug }))}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {cities && cities.length > 0 && (
            <View className="mb-6">
              <SectionTitle title="Top destinations" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                {cities.map((city) => (
                  <CityCard
                    key={city.id}
                    item={city}
                    onPress={() => setFilters((f) => ({ ...f, city: f.city === city.slug ? undefined : city.slug }))}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {!categories && categoriesLoading && !cities && citiesLoading && (
            <View className="px-4 pt-4">
              <View className="w-40 h-6 bg-gyg-light rounded mb-4" />
              <View className="flex-row">
                <View className="w-16 h-16 rounded-full bg-gyg-light mr-4" />
                <View className="w-16 h-16 rounded-full bg-gyg-light mr-4" />
                <View className="w-16 h-16 rounded-full bg-gyg-light" />
              </View>
            </View>
          )}
        </ScrollView>
      )}

      <FilterModal
        visible={filterModalOpen}
        filters={filters}
        categories={categories}
        cities={cities}
        onClose={() => setFilterModalOpen(false)}
        onApply={setFilters}
      />
    </SafeAreaView>
  );
}
