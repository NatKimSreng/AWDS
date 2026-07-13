<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Booking;
use App\Models\BookingStatusHistory;
use App\Models\TimeSlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    private const PAYMENT_TTL_MINUTES = 15;

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'activity_id' => ['required', 'integer', 'exists:activities,id'],
            'time_slot_id' => ['required', 'integer', 'exists:time_slots,id'],
            'traveler_count' => ['required', 'integer', 'min:1', 'max:50'],
            'currency' => ['nullable', 'string', 'size:3'],
            'special_requests' => ['nullable', 'string', 'max:1000'],
        ]);

        $activity = Activity::query()
            ->where('id', $validated['activity_id'])
            ->live()
            ->first();

        if (! $activity) {
            return response()->json(['message' => 'Activity not found or unavailable.'], 404);
        }

        $timeSlot = TimeSlot::query()
            ->where('id', $validated['time_slot_id'])
            ->where('activity_id', $activity->id)
            ->where('is_blackout', false)
            ->where('date', '>=', now()->toDateString())
            ->first();

        if (! $timeSlot) {
            return response()->json(['message' => 'Selected time slot is not available.'], 422);
        }

        if ($validated['traveler_count'] < $activity->min_group) {
            return response()->json([
                'message' => "This activity requires at least {$activity->min_group} travelers.",
            ], 422);
        }

        if ($validated['traveler_count'] > $activity->max_group) {
            return response()->json([
                'message' => "This activity allows at most {$activity->max_group} travelers per booking.",
            ], 422);
        }

        $lock = Cache::lock("booking:slot:{$timeSlot->id}", 10);

        if (! $lock->get()) {
            return response()->json([
                'message' => 'This slot is being booked by another traveler. Please try again.',
            ], 409);
        }

        try {
            $timeSlot->refresh();
            $remaining = $timeSlot->capacity - $timeSlot->booked_count;

            if ($validated['traveler_count'] > $remaining) {
                return response()->json([
                    'message' => 'Not enough seats available for the selected time slot.',
                    'remaining' => max(0, $remaining),
                ], 422);
            }

            $booking = DB::transaction(function () use ($request, $activity, $timeSlot, $validated) {
                $travelers = $validated['traveler_count'];
                $total = round($activity->base_price_usd * $travelers, 2);
                $commissionRate = $activity->provider->commission_rate ?? 5;
                $commission = round($total * ($commissionRate / 100), 2);
                $currency = strtoupper($validated['currency'] ?? 'USD');

                $booking = Booking::create([
                    'booking_ref' => $this->generateBookingRef(),
                    'user_id' => $request->user()->id,
                    'activity_id' => $activity->id,
                    'time_slot_id' => $timeSlot->id,
                    'booking_date' => $timeSlot->date,
                    'booking_time' => $timeSlot->start_time,
                    'traveler_count' => $travelers,
                    'status' => 'pending',
                    'total_price' => $total,
                    'commission_amount' => $commission,
                    'discount_amount' => 0,
                    'currency' => $currency,
                    'payment_method' => null,
                    'coupon_code' => null,
                    'special_requests' => $validated['special_requests'] ?? null,
                    'expires_at' => now()->addMinutes(self::PAYMENT_TTL_MINUTES),
                    'confirmed_at' => null,
                    'cancelled_at' => null,
                ]);

                $timeSlot->increment('booked_count', $travelers);

                BookingStatusHistory::create([
                    'booking_id' => $booking->id,
                    'status' => 'pending',
                    'changed_by_type' => 'system',
                    'changed_by_id' => null,
                    'note' => 'Booking created, awaiting payment.',
                ]);

                return $booking;
            });
        } finally {
            $lock->release();
        }

        return response()->json([
            'message' => 'Booking created successfully.',
            'data' => [
                'id' => $booking->id,
                'booking_ref' => $booking->booking_ref,
                'status' => $booking->status,
                'activity' => [
                    'id' => $activity->id,
                    'title' => $activity->title,
                    'slug' => $activity->slug,
                ],
                'time_slot' => [
                    'id' => $timeSlot->id,
                    'date' => $timeSlot->date->toDateString(),
                    'start_time' => $timeSlot->start_time->format('H:i'),
                ],
                'traveler_count' => $booking->traveler_count,
                'total_price' => $booking->total_price,
                'currency' => $booking->currency,
                'expires_at' => $booking->expires_at->toISOString(),
            ],
        ], 201);
    }

    private function generateBookingRef(): string
    {
        do {
            $ref = 'AK-'.strtoupper(Str::random(6));
        } while (Booking::query()->where('booking_ref', $ref)->exists());

        return $ref;
    }
}
