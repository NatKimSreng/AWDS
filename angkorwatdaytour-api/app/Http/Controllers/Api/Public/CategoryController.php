<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\ActivityCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ActivityCategory::query()
            ->where('is_active', true)
            ->whereNull('parent_id')
            ->with('children')
            ->orderBy('sort_order');

        if ($request->boolean('with_count')) {
            $query->withCount(['activities' => fn ($q) => $q->live()]);
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $category = ActivityCategory::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->with('children')
            ->firstOrFail();

        return response()->json([
            'data' => $category,
        ]);
    }
}
