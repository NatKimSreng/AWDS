<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = City::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($request->boolean('with_count')) {
            $query->withCount(['activities' => fn ($q) => $q->live()]);
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $city = City::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json([
            'data' => $city,
        ]);
    }
}
