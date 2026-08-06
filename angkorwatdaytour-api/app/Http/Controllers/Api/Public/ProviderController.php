<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Provider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProviderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $providers = Provider::query()
            ->approved()
            ->withCount('activities')
            ->orderBy('is_featured', 'desc')
            ->orderBy('business_name')
            ->paginate((int) ($validated['per_page'] ?? 24));

        return response()->json(
            $providers->through(fn (Provider $provider) => $this->mapProviderSummary($provider))
        );
    }

    public function show(string $identifier): JsonResponse
    {
        $provider = is_numeric($identifier)
            ? Provider::query()->approved()->withCount('activities')->findOrFail($identifier)
            : Provider::query()->approved()->withCount('activities')->where('slug', $identifier)->firstOrFail();

        $activities = $provider->activities()
            ->where('status', 'live')
            ->whereNotNull('published_at')
            ->with(['heroImage', 'category', 'city', 'provider'])
            ->withAvg('reviews as avg_rating', 'rating')
            ->withCount('reviews as reviews_count')
            ->orderBy('is_featured', 'desc')
            ->orderBy('published_at', 'desc')
            ->get();

        return response()->json([
            'data' => [
                ...$this->mapProviderSummary($provider),
                'bio' => $provider->bio,
                'certifications' => $this->splitList($provider->certifications),
                'specialties' => $this->splitList($provider->specialties),
                'spoken_languages' => $provider->spoken_languages ?? [],
                'website_url' => $provider->website_url,
                'phone' => $provider->phone,
                'whatsapp' => $provider->whatsapp,
                'logo_url' => $provider->logo_url,
                'cover_image_url' => $provider->cover_image_url,
                'founded_year' => $provider->founded_year,
                'team_size' => $provider->team_size,
                'activities' => $activities->map(fn ($activity) => [
                    'id' => $activity->id,
                    'title' => $activity->title,
                    'slug' => $activity->slug,
                    'duration_minutes' => $activity->duration_minutes,
                    'min_group' => $activity->min_group,
                    'max_group' => $activity->max_group,
                    'base_price_usd' => $activity->base_price_usd,
                    'avg_rating' => round((float) $activity->avg_rating, 1),
                    'reviews_count' => (int) $activity->reviews_count,
                    'is_featured' => (bool) $activity->is_featured,
                    'is_instant_book' => (bool) $activity->is_instant_book,
                    'category' => $activity->category?->only(['id', 'name', 'slug', 'icon']),
                    'city' => $activity->city?->only(['id', 'name', 'slug']),
                    'provider' => $activity->provider?->only(['id', 'business_name', 'avg_rating']),
                    'hero_image' => $activity->heroImage?->url,
                ]),
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function mapProviderSummary(Provider $provider): array
    {
        return [
            'id' => $provider->id,
            'slug' => $provider->slug,
            'business_name' => $provider->business_name,
            'tagline' => $provider->tagline,
            'bio' => $provider->bio,
            'service_area' => $provider->service_area,
            'avg_rating' => round((float) $provider->avg_rating, 1),
            'total_bookings' => (int) $provider->total_bookings,
            'activities_count' => (int) $provider->activities_count,
            'founded_year' => $provider->founded_year,
            'team_size' => $provider->team_size,
            'logo_url' => $provider->logo_url,
            'cover_image_url' => $provider->cover_image_url,
            'spoken_languages' => $provider->spoken_languages ?? [],
            'specialties' => $this->splitList($provider->specialties),
        ];
    }

    /**
     * @param array<string>|string|null $value
     * @return string[]
     */
    private function splitList(array|string|null $value): array
    {
        if (is_array($value)) {
            return collect($value)
                ->map(fn ($line) => trim((string) $line))
                ->filter()
                ->values()
                ->all();
        }

        if (! $value) {
            return [];
        }

        return collect(explode("\n", $value))
            ->map(fn (string $line) => trim($line))
            ->filter()
            ->values()
            ->all();
    }
}
