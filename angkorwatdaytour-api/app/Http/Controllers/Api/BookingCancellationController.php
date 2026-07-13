<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\CancellationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BookingCancellationController extends Controller
{
    public function __construct(
        private readonly CancellationService $cancellationService
    ) {
    }

    public function preview(Request $request, Booking $booking): JsonResponse
    {
        if ($request->user()->id !== $booking->user_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json([
            'data' => $this->cancellationService->preview($booking),
        ]);
    }

    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        if ($request->user()->id !== $booking->user_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $result = $this->cancellationService->cancel(
                $booking,
                $request->user(),
                $validated['reason'] ?? null
            );
        } catch (\InvalidArgumentException $e) {
            throw ValidationException::withMessages([
                'booking' => $e->getMessage(),
            ]);
        }

        $refund = $result['refund'];

        return response()->json([
            'message' => 'Booking cancelled successfully.',
            'data' => [
                'booking' => [
                    'id' => $result['booking']->id,
                    'booking_ref' => $result['booking']->booking_ref,
                    'status' => $result['booking']->status,
                    'cancelled_at' => $result['booking']->cancelled_at?->toISOString(),
                ],
                'refund' => $refund ? [
                    'id' => $refund->id,
                    'amount' => (float) $refund->amount,
                    'currency' => $result['booking']->currency,
                    'status' => $refund->status,
                ] : null,
                'preview' => $result['preview'],
            ],
        ]);
    }
}
