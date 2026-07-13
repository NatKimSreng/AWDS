<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Ticket;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TicketService
{
    public function generateForBooking(Booking $booking): Ticket
    {
        $ticket = $booking->ticket;

        if ($ticket) {
            return $ticket;
        }

        $ticketRef = 'TK-'.strtoupper(Str::random(6));

        $payload = [
            'booking_ref' => $booking->booking_ref,
            'ticket_ref' => $ticketRef,
            'activity' => $booking->activity?->title,
            'date' => $booking->booking_date?->toDateString(),
            'time' => $booking->booking_time?->format('H:i'),
            'travelers' => $booking->traveler_count,
            'status' => $booking->status,
        ];

        $payload['signature'] = $this->signPayload($payload);

        return Ticket::create([
            'booking_id' => $booking->id,
            'ticket_ref' => $ticketRef,
            'qr_payload' => $payload,
            'status' => 'active',
        ]);
    }

    public function regenerateQrImage(Ticket $ticket): string
    {
        try {
            $result = (new Builder(
                writer: new PngWriter(),
                data: json_encode($ticket->qr_payload),
                encoding: new Encoding('UTF-8'),
                errorCorrectionLevel: ErrorCorrectionLevel::High,
                size: 300,
                margin: 10,
                roundBlockSizeMode: RoundBlockSizeMode::Margin,
            ))->build();

            return $result->getDataUri();
        } catch (\Throwable $e) {
            Log::error('Ticket QR generation failed', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage(),
            ]);

            throw new \RuntimeException('Unable to generate ticket QR.');
        }
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function verifyPayload(array $payload): bool
    {
        $signature = $payload['signature'] ?? null;

        if (! $signature) {
            return false;
        }

        unset($payload['signature']);

        return hash_equals($this->signPayload($payload), $signature);
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function signPayload(array $payload): string
    {
        ksort($payload);

        return hash_hmac('sha256', json_encode($payload), config('app.key'));
    }
}
