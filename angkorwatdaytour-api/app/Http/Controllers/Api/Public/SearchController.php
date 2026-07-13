<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Models\City;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $term = $request->input('q');

        $activities = collect([]);
        $categories = collect([]);
        $cities = collect([]);

        if ($term && strlen($term) >= 2) {
            $activities = Activity::query()
                ->live()
                ->where(function ($q) use ($term) {
                    $q->whereFullText(['title', 'description'], $term)
                        ->orWhere('title', 'like', "%{$term}%")
                        ->orWhere('description', 'like', "%{$term}%");
                })
                ->with('heroImage')
                ->limit(8)
                ->get()
                ->map(fn ($activity) => [
                    'id' => $activity->id,
                    'title' => $activity->title,
                    'slug' => $activity->slug,
                    'base_price_usd' => $activity->base_price_usd,
                    'hero_image' => $activity->heroImage?->url,
                ]);

            $categories = ActivityCategory::query()
                ->where('is_active', true)
                ->where('name', 'like', "%{$term}%")
                ->limit(5)
                ->get()
                ->map(fn ($category) => $category->only(['id', 'name', 'slug', 'icon']));

            $cities = City::query()
                ->where('is_active', true)
                ->where('name', 'like', "%{$term}%")
                ->limit(5)
                ->get()
                ->map(fn ($city) => $city->only(['id', 'name', 'slug']));
        }

        return response()->json([
            'data' => [
                'activities' => $activities,
                'categories' => $categories,
                'cities' => $cities,
            ],
        ]);
    }
}
