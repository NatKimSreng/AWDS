<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\KhqrService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private readonly KhqrService $khqrService
    ) {
    }

    public function khqrStatus(Request $request, Payment $payment): JsonResponse
    {
        $validated = $request->validate([
            'booking_ref' => ['required', 'string', 'max:32'],
        ]);

        if ($payment->booking?->booking_ref !== $validated['booking_ref']) {
            return response()->json(['message' => 'Invalid payment reference.'], 403);
        }

        if ($payment->method !== 'khqr') {
            return response()->json(['message' => 'Invalid payment method.'], 422);
        }

        $status = $this->khqrService->checkStatus($payment);

        if ($status['paid'] && $payment->status !== 'paid') {
            $this->khqrService->markPaid($payment, $status['data'] ?? []);
            $payment->refresh();
        }

        return response()->json([
            'data' => [
                'payment_id' => $payment->id,
                'status' => $payment->status,
                'booking_status' => $payment->booking?->status,
                'paid_at' => $payment->paid_at?->toISOString(),
            ],
        ]);
    }
}
