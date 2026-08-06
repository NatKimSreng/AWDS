<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ActivityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0'],
            'duration' => ['nullable', 'integer', 'min:1'],
            'group_size' => ['nullable', 'integer', 'min:1'],
            'language' => ['nullable', 'string', 'size:2'],
            'featured' => ['nullable', 'boolean'],
            'instant_book' => ['nullable', 'boolean'],
            'date' => ['nullable', 'date', 'date_format:Y-m-d'],
            'query' => ['nullable', 'string', 'max:255'],
            'sort' => ['nullable', Rule::in(['price_asc', 'price_desc', 'rating', 'newest', 'duration'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'provider' => ['nullable', 'string', 'max:150'],
            'service_type' => ['nullable', 'string', 'max:100'],
            'transport_mode' => ['nullable', 'string', 'max:100'],
        ]);

        $query = Activity::query()
            ->live()
            ->with(['provider', 'category', 'city', 'heroImage', 'serviceTypes', 'transportModes'])
            ->withAvg('reviews as avg_rating', 'rating')
            ->withCount('reviews as reviews_count')
            ->when(
                $validated['query'] ?? null,
                fn (Builder $q, string $term) => $q->whereFullText(['title', 'description'], $term)
            )
            ->when(
                $validated['provider'] ?? null,
                function (Builder $q, string $provider) {
                    if (is_numeric($provider)) {
                        $q->where('provider_id', (int) $provider);
                    } else {
                        $q->whereHas('provider', fn ($pq) => $pq->where('slug', $provider));
                    }
                }
            );

        $this->applyFilters($query, $validated);
        $this->applySorting($query, $validated['sort'] ?? 'newest');

        $perPage = (int) ($validated['per_page'] ?? 15);

        return response()->json(
            $query->paginate($perPage)
                ->through(fn (Activity $activity) => $this->mapActivityCard($activity))
        );
    }

    public function show(string $slug): JsonResponse
    {
        $activity = Activity::query()
            ->where('slug', $slug)
            ->live()
            ->with([
                'provider',
                'category',
                'city',
                'images',
                'reviews' => fn ($q) => $q->with('user:id,name')
                    ->where('is_verified', true)
                    ->where('is_flagged', false)
                    ->latest()
                    ->limit(6),
            ])
            ->withAvg('reviews as avg_rating', 'rating')
            ->withCount('reviews as reviews_count')
            ->firstOrFail();

        return response()->json([
            'data' => [
                'id' => $activity->id,
                'title' => $activity->title,
                'slug' => $activity->slug,
                'description' => $activity->description,
                'itinerary' => $activity->itinerary_json,
                'inclusions' => $activity->inclusions,
                'exclusions' => $activity->exclusions,
                'meeting_point' => [
                    'address' => $activity->meeting_point_address,
                    'lat' => $activity->meeting_point_lat,
                    'lng' => $activity->meeting_point_lng,
                ],
                'map' => $this->mapData($activity),
                'duration_minutes' => $activity->duration_minutes,
                'min_group' => $activity->min_group,
                'max_group' => $activity->max_group,
                'base_price_usd' => $activity->base_price_usd,
                'spoken_languages' => $activity->spoken_languages,
                'is_instant_book' => $activity->is_instant_book,
                'is_featured' => $activity->is_featured,
                'is_refundable' => $activity->is_refundable,
                'free_cancellation_hours' => $activity->free_cancellation_hours,
                'what_to_bring' => $activity->what_to_bring,
                'not_allowed' => $activity->not_allowed,
                'know_before_you_go' => $activity->know_before_you_go,
                'additional_info' => $activity->additional_info,
                'not_suitable_for' => $activity->not_suitable_for,
                'weather_policy' => $activity->weather_policy,
                'start_time_flexibility' => $activity->start_time_flexibility,
                'avg_rating' => round((float) $activity->avg_rating, 1),
                'reviews_count' => (int) $activity->reviews_count,
                'category' => $activity->category?->only(['id', 'name', 'slug', 'icon']),
                'city' => $activity->city?->only(['id', 'name', 'slug']),
                'provider' => $activity->provider?->only([
                    'id',
                    'slug',
                    'business_name',
                    'tagline',
                    'bio',
                    'avg_rating',
                    'total_bookings',
                    'logo_url',
                    'cover_image_url',
                    'founded_year',
                    'team_size',
                    'spoken_languages',
                    'certifications',
                    'specialties',
                    'service_area',
                    'website_url',
                    'phone',
                    'whatsapp',
                ]),
                'hero_image' => $activity->heroImage?->url,
                'gallery' => $activity->images->pluck('url')->values(),
                'reviews' => $activity->reviews->map(fn ($review) => [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'author' => $review->user?->name,
                    'created_at' => $review->created_at?->toISOString(),
                ]),
                'published_at' => $activity->published_at?->toISOString(),
            ],
        ]);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function mapData(Activity $activity): ?array
    {
        $lat = $activity->meeting_point_lat;
        $lng = $activity->meeting_point_lng;

        if ($lat === null || $lng === null) {
            return null;
        }

        $lat = (float) $lat;
        $lng = (float) $lng;

        return [
            'lat' => $lat,
            'lng' => $lng,
            'address' => $activity->meeting_point_address,
            'google_maps_url' => "https://www.google.com/maps?q={$lat},{$lng}&z=15",
            'google_maps_embed_url' => "https://maps.google.com/maps?q={$lat},{$lng}&z=15&output=embed",
            'openstreetmap_url' => "https://www.openstreetmap.org/?mlat={$lat}&mlon={$lng}#map=16/{$lat}/{$lng}",
        ];
    }

    /**
     * @param array<string, mixed> $filters
     */
    private function applyFilters(Builder $query, array $filters): void
    {
        $query->when(
            $filters['category'] ?? null,
            fn (Builder $q, string $slug) => $q->whereHas('category', fn ($cq) => $cq->where('slug', $slug))
        )
            ->when(
                $filters['city'] ?? null,
                fn (Builder $q, string $slug) => $q->whereHas('city', fn ($cq) => $cq->where('slug', $slug))
            )
            ->when(
                isset($filters['min_price']),
                fn (Builder $q) => $q->where('base_price_usd', '>=', $filters['min_price'])
            )
            ->when(
                isset($filters['max_price']),
                fn (Builder $q) => $q->where('base_price_usd', '<=', $filters['max_price'])
            )
            ->when(
                $filters['duration'] ?? null,
                fn (Builder $q, int $duration) => $q->where('duration_minutes', '<=', $duration)
            )
            ->when(
                $filters['group_size'] ?? null,
                fn (Builder $q, int $size) => $q->where('max_group', '>=', $size)
            )
            ->when(
                $filters['language'] ?? null,
                fn (Builder $q, string $language) => $q->whereJsonContains('spoken_languages', $language)
            )
            ->when(
                ($filters['featured'] ?? null) === true,
                fn (Builder $q) => $q->where('is_featured', true)
            )
            ->when(
                ($filters['instant_book'] ?? null) === true,
                fn (Builder $q) => $q->where('is_instant_book', true)
            )
            ->when(
                ($filters['date'] ?? null),
                fn (Builder $q, string $date) => $q->whereHas(
                    'timeSlots',
                    fn ($tq) => $tq->where('date', $date)->where('remaining', '>', 0)
                )
            )
            ->when(
                $filters['service_type'] ?? null,
                fn (Builder $q, string $slug) => $q->whereHas('serviceTypes', fn ($sq) => $sq->where('slug', $slug))
            )
            ->when(
                $filters['transport_mode'] ?? null,
                fn (Builder $q, string $slug) => $q->whereHas('transportModes', fn ($tq) => $tq->where('slug', $slug))
            );
    }

    private function applySorting(Builder $query, string $sort): void
    {
        match ($sort) {
            'price_asc' => $query->orderBy('base_price_usd', 'asc'),
            'price_desc' => $query->orderBy('base_price_usd', 'desc'),
            'duration' => $query->orderBy('duration_minutes', 'asc'),
            'newest' => $query->orderBy('published_at', 'desc'),
            'rating' => $query->orderByRaw('avg_rating DESC NULLS LAST'),
            default => $query->orderBy('is_featured', 'desc')->orderBy('published_at', 'desc'),
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function mapActivityCard(Activity $activity): array
    {
        return [
            'id' => $activity->id,
            'title' => $activity->title,
            'slug' => $activity->slug,
            'duration_minutes' => $activity->duration_minutes,
            'min_group' => $activity->min_group,
            'max_group' => $activity->max_group,
            'base_price_usd' => $activity->base_price_usd,
            'is_featured' => $activity->is_featured,
            'is_instant_book' => $activity->is_instant_book,
            'avg_rating' => round((float) $activity->avg_rating, 1),
            'reviews_count' => (int) $activity->reviews_count,
            'category' => $activity->category?->only(['id', 'name', 'slug', 'icon']),
            'city' => $activity->city?->only(['id', 'name', 'slug']),
            'provider' => $activity->provider?->only(['id', 'business_name', 'avg_rating']),
            'hero_image' => $activity->heroImage?->url,
            'meeting_point_lat' => $activity->meeting_point_lat,
            'meeting_point_lng' => $activity->meeting_point_lng,
            'service_types' => $activity->serviceTypes->map(fn ($st) => $st->only(['id', 'name', 'slug', 'icon', 'badge_color']))->values(),
            'transport_modes' => $activity->transportModes->map(fn ($tm) => $tm->only(['id', 'name', 'slug', 'icon', 'badge_color', 'category']))->values(),
        ];
    }
}
