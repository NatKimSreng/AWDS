<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\Booking;
use App\Models\Review;
use App\Models\ReviewImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class ReviewService
{
    public function __construct(
        private readonly ImageUploadService $imageUploadService
    ) {
    }

    /**
     * @return array{can_review: bool, reason: string|null, activity: array<string, mixed>|null, existing_review: Review|null}
     */
    public function eligibility(Booking $booking, int $userId): array
    {
        if ($booking->user_id !== $userId) {
            return [
                'can_review' => false,
                'reason' => 'Unauthorized.',
                'activity' => null,
                'existing_review' => null,
            ];
        }

        if ($booking->status !== 'completed') {
            return [
                'can_review' => false,
                'reason' => 'Booking must be completed before leaving a review.',
                'activity' => null,
                'existing_review' => null,
            ];
        }

        $existingReview = Review::query()
            ->where('booking_id', $booking->id)
            ->first();

        if ($existingReview) {
            return [
                'can_review' => false,
                'reason' => 'You have already reviewed this booking.',
                'activity' => null,
                'existing_review' => $existingReview,
            ];
        }

        return [
            'can_review' => true,
            'reason' => null,
            'activity' => $booking->activity?->only(['id', 'title', 'slug']),
            'existing_review' => null,
        ];
    }

    /**
     * @param array<int, UploadedFile> $images
     */
    public function create(Booking $booking, int $userId, int $rating, ?string $comment, array $images = []): Review
    {
        $eligibility = $this->eligibility($booking, $userId);

        if (! $eligibility['can_review']) {
            throw new \InvalidArgumentException($eligibility['reason'] ?? 'Cannot create review.');
        }

        return DB::transaction(function () use ($booking, $userId, $rating, $comment, $images) {
            $review = Review::create([
                'booking_id' => $booking->id,
                'user_id' => $userId,
                'activity_id' => $booking->activity_id,
                'rating' => $rating,
                'comment' => $comment,
                'is_verified' => true,
                'is_flagged' => false,
            ]);

            foreach ($images as $index => $image) {
                ReviewImage::create([
                    'review_id' => $review->id,
                    'url' => $this->imageUploadService->store($image, 'reviews'),
                    'sort_order' => $index,
                ]);
            }

            $this->recalculateActivityRating($booking->activity_id);

            return $review->fresh(['images']);
        });
    }

    private function recalculateActivityRating(int $activityId): void
    {
        $activity = Activity::query()
            ->withAvg('reviews as reviews_avg_rating', 'rating')
            ->withCount('reviews as reviews_count')
            ->find($activityId);

        if (! $activity) {
            return;
        }

        $provider = $activity->provider;

        if ($provider) {
            $providerAvg = Review::query()
                ->whereHas('activity', fn ($q) => $q->where('provider_id', $provider->id))
                ->avg('rating') ?? 0;

            $providerTotalBookings = Booking::query()
                ->whereHas('activity', fn ($q) => $q->where('provider_id', $provider->id))
                ->where('status', 'completed')
                ->count();

            $provider->update([
                'avg_rating' => round((float) $providerAvg, 1),
                'total_bookings' => (int) $providerTotalBookings,
            ]);
        }
    }
}
