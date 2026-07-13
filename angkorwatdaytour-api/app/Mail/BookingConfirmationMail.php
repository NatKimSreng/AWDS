<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingConfirmationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Booking $booking,
        public readonly Ticket $ticket,
        public readonly string $qrDataUri,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your booking confirmation — {$this->booking->booking_ref}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.bookings.confirmation',
            with: [
                'booking' => $this->booking,
                'ticket' => $this->ticket,
                'qrDataUri' => $this->qrDataUri,
                'activity' => $this->booking->activity,
                'provider' => $this->booking->activity?->provider,
            ],
        );
    }
}
