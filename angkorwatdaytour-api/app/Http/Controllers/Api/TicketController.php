<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\BookingConfirmationMail;
use App\Models\Booking;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class TicketController extends Controller
{
    public function __construct(
        private readonly TicketService $ticketService
    ) {
    }

    public function show(Request $request, Booking $booking): JsonResponse
    {
        if ($request->user()->id !== $booking->user_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
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

    public function sendConfirmationEmail(Request $request, Booking $booking): JsonResponse
    {
        if ($request->user()->id !== $booking->user_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($booking->status === 'cancelled' || $booking->status === 'refunded') {
            return response()->json([
                'message' => 'Booking is no longer active.',
            ], 422);
        }

        $ticket = $this->ticketService->generateForBooking($booking);
        $qrDataUri = $this->ticketService->regenerateQrImage($ticket);

        Mail::to($request->user())->send(new BookingConfirmationMail($booking, $ticket, $qrDataUri));

        return response()->json([
            'message' => 'Confirmation email queued.',
            'data' => [
                'booking_ref' => $booking->booking_ref,
                'ticket_ref' => $ticket->ticket_ref,
            ],
        ]);
    }
}
