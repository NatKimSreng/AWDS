@component('mail::message')
# Booking confirmed

Hi {{ $booking->guest_name ?? $booking->user->name ?? 'Traveler' }},

Thank you for booking with AngkorWatDayTour. Here are your trip details:

**Booking reference:** {{ $booking->booking_ref }}
**Ticket reference:** {{ $ticket->ticket_ref }}
**Tour:** {{ $activity?->title ?? 'Your tour' }}
**Provider:** {{ $provider?->business_name ?? 'AngkorWatDayTour' }}
**Date:** {{ $booking->booking_date?->format('l, F j, Y') }}
**Time:** {{ $booking->booking_time?->format('H:i') }}
**Travelers:** {{ $booking->traveler_count }}
**Total paid:** {{ $booking->total_price }} {{ $booking->currency }}

Please present the QR code below at the meeting point on the day of your tour:

![QR Ticket]({{ $qrDataUri }})

If you have any questions, reply to this email or contact us through the app.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
