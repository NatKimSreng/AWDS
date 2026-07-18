<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingStatusHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    private const ALLOWED_TRANSITIONS = [
        'pending' => ['confirmed', 'cancelled'],
        'confirmed' => ['completed', 'cancelled'],
        'completed' => ['cancelled'],
    ];

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'confirmed', 'completed', 'cancelled', 'refunded'])],
            'query' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Booking::query()
            ->with(['activity.provider', 'user', 'timeSlot'])
            ->orderByDesc('created_at');

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (! empty($validated['query'])) {
            $term = $validated['query'];
            $query->where(function ($q) use ($term) {
                $q->where('booking_ref', 'like', "%{$term}%")
                    ->orWhereHas('user', function ($uq) use ($term) {
                        $uq->where('name', 'like', "%{$term}%")
                            ->orWhere('email', 'like', "%{$term}%");
                    })
                    ->orWhereHas('activity', function ($aq) use ($term) {
                        $aq->where('title', 'like', "%{$term}%");
                    });
            });
        }

        $paginator = $query->paginate((int) ($validated['per_page'] ?? 20));
        $paginator->getCollection()->transform(fn (Booking $booking) => $this->mapBookingDetail($booking));

        return response()->json($paginator);
    }

    public function show(Request $request, Booking $booking): JsonResponse
    {
        $booking->loadMissing(['activity.provider', 'user', 'timeSlot', 'addons', 'statusHistories', 'review']);

        return response()->json([
            'data' => $this->mapBookingDetail($booking),
        ]);
    }

    public function updateStatus(Request $request, Booking $booking): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['confirmed', 'completed', 'cancelled'])],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $newStatus = $validated['status'];
        $currentStatus = $booking->status;

        if (! isset(self::ALLOWED_TRANSITIONS[$currentStatus]) || ! in_array($newStatus, self::ALLOWED_TRANSITIONS[$currentStatus], true)) {
            return response()->json([
                'message' => "Cannot transition booking from {$currentStatus} to {$newStatus}.",
            ], 422);
        }

        $updateData = ['status' => $newStatus];

        if ($newStatus === 'confirmed') {
            $updateData['confirmed_at'] = now();
            $updateData['cancelled_at'] = null;
        }

        if ($newStatus === 'completed') {
            $updateData['confirmed_at'] = $booking->confirmed_at ?? now();
        }

        if ($newStatus === 'cancelled') {
            $updateData['cancelled_at'] = now();

            if ($booking->timeSlot) {
                $booking->timeSlot->decrement('booked_count', $booking->traveler_count);
            }
        }

        $booking->update($updateData);

        BookingStatusHistory::create([
            'booking_id' => $booking->id,
            'status' => $newStatus,
            'changed_by_type' => 'admin',
            'changed_by_id' => $request->user()->id,
            'note' => $validated['note'] ?? null,
        ]);

        return response()->json([
            'message' => 'Booking status updated.',
            'data' => $this->mapBookingDetail($booking->fresh(['activity', 'user', 'timeSlot'])),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function mapBookingDetail(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'booking_ref' => $booking->booking_ref,
            'status' => $booking->status,
            'booking_date' => $booking->booking_date?->toDateString(),
            'booking_time' => $booking->booking_time?->format('H:i'),
            'traveler_count' => $booking->traveler_count,
            'total_price' => $booking->total_price,
            'commission_amount' => $booking->commission_amount,
            'currency' => $booking->currency,
            'payment_method' => $booking->payment_method,
            'special_requests' => $booking->special_requests,
            'confirmed_at' => $booking->confirmed_at?->toISOString(),
            'cancelled_at' => $booking->cancelled_at?->toISOString(),
            'created_at' => $booking->created_at?->toISOString(),
            'activity' => $booking->activity?->only(['id', 'title', 'slug']),
            'provider' => $booking->activity?->provider ? $booking->activity->provider->only(['id', 'business_name']) : null,
            'customer' => $booking->user ? $booking->user->only(['id', 'name', 'email', 'phone']) : [
                'name' => $booking->guest_name,
                'email' => $booking->guest_email,
                'phone' => $booking->guest_phone,
            ],
            'time_slot' => $booking->timeSlot ? [
                'id' => $booking->timeSlot->id,
                'date' => $booking->timeSlot->date->toDateString(),
                'start_time' => $booking->timeSlot->start_time?->format('H:i'),
            ] : null,
            'addons' => $booking->addons->map(fn ($addon) => $addon->only(['id', 'name', 'price']))->values(),
            'status_history' => $booking->statusHistories->map(fn ($history) => [
                'status' => $history->status,
                'changed_by_type' => $history->changed_by_type,
                'note' => $history->note,
                'created_at' => $history->created_at?->toISOString(),
            ])->values(),
        ];
    }
}
