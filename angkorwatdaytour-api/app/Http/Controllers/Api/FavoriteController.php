<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Favorite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $favorites = $request->user()
            ->favorites()
            ->with(['activity', 'activity.provider', 'activity.category', 'activity.city', 'activity.heroImage', 'activity.images'])
            ->orderByDesc('created_at')
            ->paginate(20);

        $items = $favorites->getCollection()->map(fn ($favorite) => [
            'id' => $favorite->id,
            'activity' => $this->mapActivity($favorite->activity),
        ]);

        return response()->json([
            'data' => $items,
            'current_page' => $favorites->currentPage(),
            'last_page' => $favorites->lastPage(),
            'per_page' => $favorites->perPage(),
            'total' => $favorites->total(),
            'next_page_url' => $favorites->nextPageUrl(),
            'prev_page_url' => $favorites->previousPageUrl(),
        ]);
    }

    public function toggle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'activity_id' => ['required', 'integer', 'exists:activities,id'],
        ]);

        $favorite = Favorite::query()
            ->where('user_id', $request->user()->id)
            ->where('activity_id', $validated['activity_id'])
            ->first();

        if ($favorite) {
            $favorite->delete();

            return response()->json([
                'data' => [
                    'activity_id' => $validated['activity_id'],
                    'is_favorite' => false,
                ],
            ]);
        }

        Favorite::create([
            'user_id' => $request->user()->id,
            'activity_id' => $validated['activity_id'],
        ]);

        return response()->json([
            'data' => [
                'activity_id' => $validated['activity_id'],
                'is_favorite' => true,
            ],
        ], 201);
    }

    public function status(Request $request, Activity $activity): JsonResponse
    {
        $isFavorite = Favorite::query()
            ->where('user_id', $request->user()?->id)
            ->where('activity_id', $activity->id)
            ->exists();

        return response()->json([
            'data' => [
                'activity_id' => $activity->id,
                'is_favorite' => $isFavorite,
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function mapActivity(?Activity $activity): ?array
    {
        if (! $activity) {
            return null;
        }

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
        ];
    }
}
