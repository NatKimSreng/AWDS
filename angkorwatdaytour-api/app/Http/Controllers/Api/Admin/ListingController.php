<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ListingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['draft', 'pending', 'live', 'paused'])],
            'provider_id' => ['nullable', 'integer', 'exists:providers,id'],
            'query' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Activity::query()
            ->with(['provider', 'category', 'city', 'heroImage'])
            ->orderByDesc('created_at');

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (! empty($validated['provider_id'])) {
            $query->where('provider_id', $validated['provider_id']);
        }

        if (! empty($validated['query'])) {
            $term = $validated['query'];
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                    ->orWhereHas('provider', function ($pq) use ($term) {
                        $pq->where('business_name', 'like', "%{$term}%");
                    });
            });
        }

        return response()->json(
            $query->paginate((int) ($validated['per_page'] ?? 20))
                ->through(fn (Activity $activity) => $this->mapListing($activity))
        );
    }

    public function show(Request $request, Activity $listing): JsonResponse
    {
        $listing->loadMissing(['provider.user', 'category', 'city', 'heroImage', 'images']);

        return response()->json([
            'data' => [
                ...$this->mapListing($listing),
                'description' => $listing->description,
                'itinerary' => $listing->itinerary_json,
                'inclusions' => $listing->inclusions,
                'exclusions' => $listing->exclusions,
                'meeting_point' => [
                    'address' => $listing->meeting_point_address,
                    'lat' => $listing->meeting_point_lat,
                    'lng' => $listing->meeting_point_lng,
                ],
                'min_group' => $listing->min_group,
                'is_instant_book' => $listing->is_instant_book,
                'spoken_languages' => $listing->spoken_languages,
                'published_at' => $listing->published_at?->toISOString(),
                'gallery' => $listing->images->map(fn ($image) => [
                    'id' => $image->id,
                    'url' => $image->url,
                    'is_hero' => $image->is_hero,
                ])->values(),
            ],
        ]);
    }

    public function updateStatus(Request $request, Activity $listing): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['draft', 'pending', 'live', 'paused'])],
        ]);

        $updates = ['status' => $validated['status']];

        if ($validated['status'] === 'live' && ! $listing->published_at) {
            $updates['published_at'] = now();
        }

        $listing->update($updates);

        return response()->json([
            'message' => 'Listing status updated.',
            'data' => $this->mapListing($listing->fresh(['provider', 'category', 'city', 'heroImage'])),
        ]);
    }

    public function toggleFeatured(Request $request, Activity $listing): JsonResponse
    {
        $listing->update([
            'is_featured' => ! $listing->is_featured,
        ]);

        return response()->json([
            'message' => 'Listing featured status updated.',
            'data' => $this->mapListing($listing->fresh(['provider', 'category', 'city', 'heroImage'])),
        ]);
    }

    public function destroy(Request $request, Activity $listing): JsonResponse
    {
        $listing->delete();

        return response()->json(['message' => 'Listing deleted.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function mapListing(Activity $activity): array
    {
        return [
            'id' => $activity->id,
            'title' => $activity->title,
            'slug' => $activity->slug,
            'duration_minutes' => $activity->duration_minutes,
            'max_group' => $activity->max_group,
            'base_price_usd' => $activity->base_price_usd,
            'status' => $activity->status,
            'is_featured' => $activity->is_featured,
            'is_instant_book' => $activity->is_instant_book,
            'category' => $activity->category?->only(['id', 'name', 'slug']),
            'city' => $activity->city?->only(['id', 'name', 'slug']),
            'provider' => $activity->provider ? $activity->provider->only(['id', 'business_name', 'verification_status']) : null,
            'hero_image' => $activity->heroImage?->url,
            'created_at' => $activity->created_at?->toISOString(),
        ];
    }
}
