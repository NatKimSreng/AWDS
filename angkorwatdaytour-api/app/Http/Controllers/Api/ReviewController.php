<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct(
        private readonly ReviewService $reviewService
    ) {
    }

    public function eligibility(Request $request, Booking $booking): JsonResponse
    {
        return response()->json([
            'data' => $this->reviewService->eligibility($booking, $request->user()->id),
        ]);
    }

    public function store(Request $request, Booking $booking): JsonResponse
    {
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        try {
            $review = $this->reviewService->create(
                $booking,
                $request->user()->id,
                $validated['rating'],
                $validated['comment'] ?? null,
                $request->file('images') ?? []
            );
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Review submitted successfully.',
            'data' => [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'images' => $review->images->map(fn ($image) => [
                    'id' => $image->id,
                    'url' => $image->url,
                    'sort_order' => $image->sort_order,
                ]),
                'created_at' => $review->created_at?->toISOString(),
            ],
        ], 201);
    }

    public function publicForActivity(Request $request, string $slug): JsonResponse
    {
        $reviews = Review::query()
            ->whereHas('activity', fn ($q) => $q->where('slug', $slug))
            ->where('is_verified', true)
            ->where('is_flagged', false)
            ->with(['user:id,name', 'images'])
            ->orderByDesc('created_at')
            ->paginate((int) $request->input('per_page', 15));

        return response()->json($reviews);
    }
}
