<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\TransportMode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransportModeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TransportMode::query()
            ->where('is_active', true)
            ->orderBy('sort_order');

        if ($request->boolean('with_count')) {
            $query->withCount(['activities' => fn ($q) => $q->live()]);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $mode = TransportMode::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json([
            'data' => $mode,
        ]);
    }
}
