<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use KHQR\BakongKHQR;
use KHQR\Helpers\KHQRData;
use KHQR\Models\IndividualInfo;

class KhqrService
{
    public function generateForBooking(Booking $booking): Payment
    {
        $qr = $this->generateQrString($booking);

        return Payment::updateOrCreate(
            [
                'booking_id' => $booking->id,
                'method' => 'khqr',
                'provider_ref' => $qr['md5'],
            ],
            [
                'amount' => $booking->total_price,
                'currency' => $booking->currency,
                'status' => 'pending',
                'gateway_response' => $qr,
            ]
        );
    }

    /**
     * @return array{qr: string, md5: string}
     */
    public function generateQrString(Booking $booking): array
    {
        $currencyCode = strtoupper($booking->currency) === 'USD'
            ? KHQRData::CURRENCY_USD
            : KHQRData::CURRENCY_KHR;

        $expirationMs = $booking->expires_at
            ? (string) ($booking->expires_at->getTimestamp() * 1000)
            : (string) ((now()->addMinutes(15)->getTimestamp()) * 1000);

        $info = new IndividualInfo(
            bakongAccountID: config('services.bakong.account_id', ''),
            merchantName: config('services.bakong.merchant_name', 'AngkorWatDayTour'),
            merchantCity: config('services.bakong.merchant_city', 'Siem Reap'),
            acquiringBank: null,
            accountInformation: null,
            currency: $currencyCode,
            amount: (float) $booking->total_price,
            billNumber: $booking->booking_ref,
            storeLabel: 'AngkorWatDayTour',
            terminalLabel: 'MobileApp',
            mobileNumber: null,
            purposeOfTransaction: "Booking {$booking->booking_ref}",
            languagePreference: null,
            merchantNameAlternateLanguage: null,
            merchantCityAlternateLanguage: null,
            upiMerchantAccount: null,
            expirationTimestamp: $expirationMs,
            merchantCategoryCode: config('services.bakong.merchant_category_code', '5999'),
        );

        $response = BakongKHQR::generateIndividual($info);

        if ($response->status['code'] !== 0 || ! is_array($response->data)) {
            throw new \RuntimeException($response->status['message'] ?? 'Failed to generate KHQR.');
        }

        return [
            'qr' => (string) $response->data['qr'],
            'md5' => (string) $response->data['md5'],
        ];
    }

    /**
     * Check payment status with the Bakong API.
     *
     * @return array{paid: bool, data: array<string, mixed>|null}
     */
    public function checkStatus(Payment $payment): array
    {
        $token = config('services.bakong.api_token');

        if (empty($token)) {
            return ['paid' => false, 'data' => null];
        }

        try {
            $client = new BakongKHQR($token);
            $result = $client->checkTransactionByMD5($payment->provider_ref ?? '');

            if (($result['responseCode'] ?? null) === 0 && ! empty($result['data'])) {
                return ['paid' => true, 'data' => $result['data']];
            }
        } catch (\Throwable $e) {
            Log::warning('Bakong status check failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);
        }

        return ['paid' => false, 'data' => null];
    }

    public function markPaid(Payment $payment, ?array $gatewayData = null): void
    {
        if ($payment->status === 'paid') {
            return;
        }

        $payment->update([
            'status' => 'paid',
            'paid_at' => now(),
            'gateway_response' => array_merge($payment->gateway_response ?? [], $gatewayData ?? []),
        ]);

        $booking = $payment->booking;
        $booking->update([
            'status' => 'confirmed',
            'payment_method' => 'khqr',
            'confirmed_at' => now(),
        ]);

        $booking->statusHistories()->create([
            'status' => 'confirmed',
            'changed_by_type' => 'system',
            'changed_by_id' => null,
            'note' => 'KHQR payment received.',
        ]);
    }
}
