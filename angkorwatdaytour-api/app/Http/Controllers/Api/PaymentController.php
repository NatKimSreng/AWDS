<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
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

    public function khqr(Request $request, Booking $booking): JsonResponse
    {
        if ($request->user()->id !== $booking->user_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
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

    public function khqrStatus(Request $request, Payment $payment): JsonResponse
    {
        if ($request->user()->id !== $payment->booking?->user_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
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

    public function khqrWebhook(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'md5' => ['required', 'string', 'size:32'],
            'status' => ['required', 'string', 'in:success,paid,failed'],
            'transaction_id' => ['nullable', 'string'],
            'amount' => ['nullable', 'numeric'],
            'currency' => ['nullable', 'string', 'size:3'],
            'paid_at' => ['nullable', 'date'],
        ]);

        $secret = config('services.bakong.webhook_secret');
        $signature = $request->header('X-Bakong-Signature');

        if (! empty($secret)) {
            $body = $request->getContent();
            $expected = hash_hmac('sha256', $body, $secret);

            if (! hash_equals($expected, (string) $signature)) {
                return response()->json(['message' => 'Invalid signature.'], 401);
            }
        }

        $payment = Payment::query()
            ->where('provider_ref', $payload['md5'])
            ->where('method', 'khqr')
            ->first();

        if (! $payment) {
            return response()->json(['message' => 'Payment not found.'], 404);
        }

        if ($payload['status'] === 'success' || $payload['status'] === 'paid') {
            $this->khqrService->markPaid($payment, [
                'transaction_id' => $payload['transaction_id'] ?? null,
                'amount' => $payload['amount'] ?? null,
                'currency' => $payload['currency'] ?? null,
                'paid_at' => $payload['paid_at'] ?? now()->toISOString(),
                'source' => 'webhook',
            ]);
        }

        return response()->json(['message' => 'Webhook processed.']);
    }
}
