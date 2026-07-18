<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Mail\BookingConfirmationMail;
use App\Models\Booking;
use App\Models\BookingStatusHistory;
use App\Models\TimeSlot;
use App\Services\KhqrService;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    private const PAYMENT_TTL_MINUTES = 15;

    public function __construct(
        private readonly KhqrService $khqrService,
        private readonly TicketService $ticketService,
    ) {
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'time_slot_id' => ['required', 'integer', 'exists:time_slots,id'],
            'traveler_count' => ['required', 'integer', 'min:1', 'max:50'],
            'currency' => ['nullable', 'string', 'size:3'],
            'special_requests' => ['nullable', 'string', 'max:1000'],
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['required', 'email', 'max:255'],
            'guest_phone' => ['nullable', 'string', 'max:30'],
        ]);

        $timeSlot = TimeSlot::query()->with('activity')->find($validated['time_slot_id']);

        if (! $timeSlot) {
            return response()->json(['message' => 'Selected time slot is not available.'], 422);
        }

        $activity = $timeSlot->activity;

        if (! $activity || $activity->status !== 'live' || ! $activity->published_at) {
            return response()->json(['message' => 'Activity not found or unavailable.'], 404);
        }

        if ($timeSlot->is_blackout || $timeSlot->date->format('Y-m-d') < now()->toDateString()) {
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

            $booking = DB::transaction(function () use ($activity, $timeSlot, $validated) {
                $travelers = $validated['traveler_count'];
                $total = round($activity->base_price_usd * $travelers, 2);
                $commissionRate = $activity->provider->commission_rate ?? 5;
                $commission = round($total * ($commissionRate / 100), 2);
                $currency = strtoupper($validated['currency'] ?? 'USD');

                $booking = Booking::create([
                    'booking_ref' => $this->generateBookingRef(),
                    'user_id' => null,
                    'guest_email' => $validated['guest_email'],
                    'guest_name' => $validated['guest_name'],
                    'guest_phone' => $validated['guest_phone'] ?? null,
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
                    'note' => 'Guest booking created on website, awaiting payment.',
                ]);

                return $booking;
            });
        } finally {
            $lock->release();
        }

        return response()->json([
            'message' => 'Booking created successfully.',
            'data' => $this->mapBookingResponse($booking, $activity, $timeSlot),
        ], 201);
    }

    public function show(Request $request, string $bookingRef): JsonResponse
    {
        $booking = Booking::query()
            ->where('booking_ref', $bookingRef)
            ->with(['activity', 'activity.provider', 'activity.heroImage', 'timeSlot'])
            ->first();

        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        return response()->json([
            'data' => $this->mapBookingResponse(
                $booking,
                $booking->activity,
                $booking->timeSlot
            ),
        ]);
    }

    public function ticket(Request $request, string $bookingRef): JsonResponse
    {
        $validated = $request->validate([
            'guest_email' => ['required', 'email'],
        ]);

        $booking = Booking::query()
            ->where('booking_ref', $bookingRef)
            ->where('guest_email', $validated['guest_email'])
            ->with(['activity', 'activity.provider', 'timeSlot'])
            ->first();

        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        if ($booking->status === 'cancelled' || $booking->status === 'refunded') {
            return response()->json([
                'message' => 'Booking is no longer active.',
                'status' => $booking->status,
            ], 422);
        }

        $ticket = $this->ticketService->generateForBooking($booking);
        $qrDataUri = $this->ticketService->regenerateQrImage($ticket);

        return response()->json([
            'data' => [
                'ticket_ref' => $ticket->ticket_ref,
                'booking_ref' => $booking->booking_ref,
                'status' => $ticket->status,
                'booking_status' => $booking->status,
                'activity' => $booking->activity?->title,
                'date' => $booking->booking_date?->toDateString(),
                'time' => $booking->booking_time?->format('H:i'),
                'travelers' => $booking->traveler_count,
                'total_price' => $booking->total_price,
                'currency' => $booking->currency,
                'qr_data_uri' => $qrDataUri,
                'qr_payload' => $ticket->qr_payload,
                'provider' => $booking->activity?->provider?->business_name,
            ],
        ]);
    }

    public function sendConfirmationEmail(Request $request, string $bookingRef): JsonResponse
    {
        $validated = $request->validate([
            'guest_email' => ['required', 'email'],
        ]);

        $booking = Booking::query()
            ->where('booking_ref', $bookingRef)
            ->where('guest_email', $validated['guest_email'])
            ->with(['activity', 'activity.provider'])
            ->first();

        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        if ($booking->status === 'cancelled' || $booking->status === 'refunded') {
            return response()->json(['message' => 'Booking is no longer active.'], 422);
        }

        $ticket = $this->ticketService->generateForBooking($booking);
        $qrDataUri = $this->ticketService->regenerateQrImage($ticket);

        Mail::to($booking->guest_email)
            ->send(new BookingConfirmationMail($booking, $ticket, $qrDataUri));

        return response()->json([
            'message' => 'Confirmation email sent.',
            'data' => [
                'booking_ref' => $booking->booking_ref,
                'ticket_ref' => $ticket->ticket_ref,
            ],
        ]);
    }

    public function khqr(Request $request, string $bookingRef): JsonResponse
    {
        $validated = $request->validate([
            'guest_email' => ['required', 'email'],
        ]);

        $booking = Booking::query()
            ->where('booking_ref', $bookingRef)
            ->where('guest_email', $validated['guest_email'])
            ->with('activity')
            ->first();

        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        if ($booking->status !== 'pending') {
            return response()->json([
                'message' => 'Booking is not awaiting payment.',
                'status' => $booking->status,
            ], 422);
        }

        try {
            $payment = $this->khqrService->generateForBooking($booking);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }

        return response()->json([
            'data' => [
                'payment_id' => $payment->id,
                'booking_ref' => $booking->booking_ref,
                'qr' => $payment->gateway_response['qr'] ?? null,
                'md5' => $payment->provider_ref,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'expires_at' => $booking->expires_at?->toISOString(),
            ],
        ]);
    }

    /**
     * @param array<string, mixed> $data
     */
    private function mapBookingResponse(Booking $booking, ?\App\Models\Activity $activity, ?TimeSlot $timeSlot): array
    {
        return [
            'id' => $booking->id,
            'booking_ref' => $booking->booking_ref,
            'status' => $booking->status,
            'guest_name' => $booking->guest_name,
            'guest_email' => $booking->guest_email,
            'guest_phone' => $booking->guest_phone,
            'activity' => $activity ? [
                'id' => $activity->id,
                'title' => $activity->title,
                'slug' => $activity->slug,
                'hero_image' => $activity->heroImage?->url,
            ] : null,
            'time_slot' => $timeSlot ? [
                'id' => $timeSlot->id,
                'date' => $timeSlot->date->toDateString(),
                'start_time' => $timeSlot->start_time->format('H:i'),
            ] : null,
            'traveler_count' => $booking->traveler_count,
            'total_price' => $booking->total_price,
            'currency' => $booking->currency,
            'special_requests' => $booking->special_requests,
            'expires_at' => $booking->expires_at?->toISOString(),
        ];
    }

    private function generateBookingRef(): string
    {
        do {
            $ref = 'AK-'.strtoupper(Str::random(6));
        } while (Booking::query()->where('booking_ref', $ref)->exists());

        return $ref;
    }
}
