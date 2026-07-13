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
            ->with('activity', 'activity.provider', 'activity.heroImage')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($favorites);
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
}
