<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Provider;
use Illuminate\Http\JsonResponse;

class ProviderController extends Controller
{
    public function show(int $id): JsonResponse
    {
        $provider = Provider::query()
            ->approved()
            ->withCount('activities')
            ->findOrFail($id);

        $activities = $provider->activities()
            ->where('status', 'live')
            ->whereNotNull('published_at')
            ->with('heroImage')
            ->withAvg('reviews as avg_rating', 'rating')
            ->withCount('reviews as reviews_count')
            ->orderBy('is_featured', 'desc')
            ->orderBy('published_at', 'desc')
            ->get();

        return response()->json([
            'data' => [
                'id' => $provider->id,
                'business_name' => $provider->business_name,
                'bio' => $provider->bio,
                'service_area' => $provider->service_area,
                'avg_rating' => round((float) $provider->avg_rating, 1),
                'total_bookings' => (int) $provider->total_bookings,
                'activities_count' => (int) $provider->activities_count,
                'activities' => $activities->map(fn ($activity) => [
                    'id' => $activity->id,
                    'title' => $activity->title,
                    'slug' => $activity->slug,
                    'duration_minutes' => $activity->duration_minutes,
                    'base_price_usd' => $activity->base_price_usd,
                    'avg_rating' => round((float) $activity->avg_rating, 1),
                    'reviews_count' => (int) $activity->reviews_count,
                    'hero_image' => $activity->heroImage?->url,
                ]),
            ],
        ]);
    }
}
