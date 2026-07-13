<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Refund;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CancellationService
{
    /**
     * Hours before the activity start time within which a cancellation
     * is allowed but no refund is issued.
     */
    public const FULL_REFUND_HOURS = 24;

    /**
     * Return a non-destructive preview of what would happen if the
     * booking were cancelled now.
     *
     * @return array{
     *     can_cancel: bool,
     *     refund_amount: float,
     *     refund_eligible: bool,
     *     refund_policy: string,
     *     starts_at: string|null,
     *     cutoff_at: string|null,
     *     reason_required: bool,
     *     message: string,
     * }
     */
    public function preview(Booking $booking): array
    {
        $startsAt = $this->startsAt($booking);

        if (! $this->canCancel($booking)) {
            return [
                'can_cancel' => false,
                'refund_amount' => 0.0,
                'refund_eligible' => false,
                'refund_policy' => 'none',
                'starts_at' => $startsAt?->toISOString(),
                'cutoff_at' => null,
                'reason_required' => false,
                'message' => $this->cannotCancelMessage($booking),
            ];
        }

        $refundAmount = $this->calculateRefundAmount($booking);
        $cutoffAt = $startsAt?->clone()->subHours(self::FULL_REFUND_HOURS);

        if ($refundAmount > 0) {
            $policy = 'full_refund';
            $message = 'Cancelling now will issue a full refund to your original payment method.';
        } else {
            $policy = 'no_refund';
            $message = 'Cancellations within 24 hours of the start time are non-refundable.';
        }

        return [
            'can_cancel' => true,
            'refund_amount' => $refundAmount,
            'refund_eligible' => $refundAmount > 0,
            'refund_policy' => $policy,
            'starts_at' => $startsAt?->toISOString(),
            'cutoff_at' => $cutoffAt?->toISOString(),
            'reason_required' => false,
            'message' => $message,
        ];
    }

    /**
     * Cancel a booking and, if applicable, create a refund record.
     *
     * @return array{
     *     booking: Booking,
     *     refund: Refund|null,
     *     preview: array,
     * }
     *
     * @throws \InvalidArgumentException if the booking cannot be cancelled.
     */
    public function cancel(Booking $booking, ?User $user = null, ?string $reason = null): array
    {
        $preview = $this->preview($booking);

        if (! $preview['can_cancel']) {
            throw new \InvalidArgumentException($preview['message']);
        }

        $summary = DB::transaction(function () use ($booking, $user, $reason, $preview) {
            $booking->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
            ]);

            if ($booking->timeSlot) {
                $booking->timeSlot->decrement('booked_count', $booking->traveler_count);
            }

            if ($booking->ticket) {
                $booking->ticket->update(['status' => 'cancelled']);
            }

            $booking->statusHistories()->create([
                'status' => 'cancelled',
                'changed_by_type' => $user ? 'user' : 'system',
                'changed_by_id' => $user?->id,
                'note' => $reason ? "Customer cancelled: {$reason}" : 'Customer cancelled the booking.',
            ]);

            $refund = null;

            if ($preview['refund_amount'] > 0) {
                $paidPayment = $booking->payments()
                    ->where('status', 'paid')
                    ->first();

                if ($paidPayment) {
                    $refund = Refund::create([
                        'payment_id' => $paidPayment->id,
                        'booking_id' => $booking->id,
                        'amount' => $preview['refund_amount'],
                        'reason' => $reason,
                        'status' => 'pending',
                        'processed_by_type' => 'system',
                        'processed_by_id' => null,
                    ]);
                }
            }

            return [
                'booking' => $booking->fresh(),
                'refund' => $refund,
            ];
        });

        Log::info('Booking cancelled', [
            'booking_id' => $booking->id,
            'user_id' => $user?->id,
            'refund_amount' => $preview['refund_amount'],
        ]);

        return [
            'booking' => $summary['booking'],
            'refund' => $summary['refund'],
            'preview' => $preview,
        ];
    }

    public function canCancel(Booking $booking): bool
    {
        if (in_array($booking->status, ['cancelled', 'refunded', 'completed'], true)) {
            return false;
        }

        $startsAt = $this->startsAt($booking);

        if (! $startsAt) {
            return true;
        }

        return $startsAt->isFuture();
    }

    public function calculateRefundAmount(Booking $booking): float
    {
        if (! $this->hasPaidPayment($booking)) {
            return 0.0;
        }

        $startsAt = $this->startsAt($booking);

        if (! $startsAt) {
            return 0.0;
        }

        if (now()->diffInHours($startsAt, false) > self::FULL_REFUND_HOURS) {
            return (float) $booking->total_price;
        }

        return 0.0;
    }

    private function hasPaidPayment(Booking $booking): bool
    {
        return $booking->payments()->where('status', 'paid')->exists();
    }

    private function startsAt(Booking $booking): ?Carbon
    {
        if (! $booking->booking_date || ! $booking->booking_time) {
            return null;
        }

        return Carbon::parse($booking->booking_date->toDateString().' '.$booking->booking_time->format('H:i:s'));
    }

    private function cannotCancelMessage(Booking $booking): string
    {
        if (in_array($booking->status, ['cancelled', 'refunded'], true)) {
            return 'This booking has already been cancelled or refunded.';
        }

        if ($booking->status === 'completed') {
            return 'Completed bookings cannot be cancelled.';
        }

        $startsAt = $this->startsAt($booking);

        if ($startsAt && $startsAt->isPast()) {
            return 'The activity has already started or passed.';
        }

        return 'This booking cannot be cancelled.';
    }
}
