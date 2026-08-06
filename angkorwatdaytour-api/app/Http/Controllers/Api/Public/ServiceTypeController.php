<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\ServiceType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceTypeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ServiceType::query()
            ->where('is_active', true)
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
        $type = ServiceType::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json([
            'data' => $type,
        ]);
    }
}
