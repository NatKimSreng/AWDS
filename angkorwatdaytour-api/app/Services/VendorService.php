<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Provider;
use App\Models\Payout;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class VendorService
{
    /**
     * Build dashboard stats for an approved provider.
     *
     * @return array<string, mixed>
     */
    public function dashboardStats(Provider $provider): array
    {
        $activityIds = $provider->activities()->pluck('id');

        $listingsCounts = $provider->activities()
            ->selectRaw("status, count(*) as count")
            ->groupBy('status')
            ->pluck('count', 'status');

        $bookingCounts = Booking::query()
            ->whereIn('activity_id', $activityIds)
            ->selectRaw("status, count(*) as count")
            ->groupBy('status')
            ->pluck('count', 'status');

        $earnings = Booking::query()
            ->whereIn('activity_id', $activityIds)
            ->whereIn('status', ['confirmed', 'completed'])
            ->selectRaw('sum(total_price) as gross, sum(commission_amount) as commission')
            ->first();

        $unreadMessages = DB::table('message_threads')
            ->where('provider_id', $provider->id)
            ->whereExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('messages')
                    ->whereColumn('messages.thread_id', 'message_threads.id')
                    ->whereNull('messages.read_at')
                    ->whereRaw("messages.sender_type != 'provider'");
            })
            ->count();

        $recentBookings = Booking::query()
            ->whereIn('activity_id', $activityIds)
            ->with(['activity', 'user'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn (Booking $booking) => [
                'id' => $booking->id,
                'booking_ref' => $booking->booking_ref,
                'status' => $booking->status,
                'traveler_count' => $booking->traveler_count,
                'total_price' => $booking->total_price,
                'currency' => $booking->currency,
                'created_at' => $booking->created_at?->toISOString(),
                'activity' => $booking->activity?->only(['id', 'title', 'slug']),
                'customer' => $booking->user ? $booking->user->only(['id', 'name']) : null,
            ]);

        $gross = (float) ($earnings->gross ?? 0);
        $commission = (float) ($earnings->commission ?? 0);
        $net = $gross - $commission;

        return [
            'total_listings' => (int) $provider->activities()->count(),
            'live_listings' => (int) ($listingsCounts['live'] ?? 0),
            'pending_listings' => (int) ($listingsCounts['pending'] ?? 0),
            'draft_listings' => (int) ($listingsCounts['draft'] ?? 0),
            'total_bookings' => (int) array_sum($bookingCounts->toArray()),
            'pending_bookings' => (int) ($bookingCounts['pending'] ?? 0),
            'confirmed_bookings' => (int) ($bookingCounts['confirmed'] ?? 0),
            'completed_bookings' => (int) ($bookingCounts['completed'] ?? 0),
            'cancelled_bookings' => (int) ($bookingCounts['cancelled'] ?? 0),
            'total_earnings_gross' => round($gross, 2),
            'total_commission' => round($commission, 2),
            'current_balance' => round($net, 2),
            'unread_messages' => (int) $unreadMessages,
            'recent_bookings' => $recentBookings,
        ];
    }

    /**
     * Earnings summary grouped by month.
     *
     * @return array<string, mixed>
     */
    public function earningsSummary(Provider $provider): array
    {
        $activityIds = $provider->activities()->pluck('id');

        $totals = Booking::query()
            ->whereIn('activity_id', $activityIds)
            ->whereIn('status', ['confirmed', 'completed'])
            ->selectRaw('sum(total_price) as gross, sum(commission_amount) as commission, count(*) as bookings')
            ->first();

        $monthly = Booking::query()
            ->whereIn('activity_id', $activityIds)
            ->whereIn('status', ['confirmed', 'completed'])
            ->selectRaw("date_format(confirmed_at, '%Y-%m') as month, sum(total_price) as gross, sum(commission_amount) as commission, count(*) as bookings")
            ->groupBy('month')
            ->orderByDesc('month')
            ->get()
            ->map(fn ($row) => [
                'month' => $row->month,
                'gross' => round((float) $row->gross, 2),
                'commission' => round((float) $row->commission, 2),
                'net' => round((float) $row->gross - (float) $row->commission, 2),
                'bookings' => (int) $row->bookings,
            ]);

        return [
            'gross' => round((float) ($totals->gross ?? 0), 2),
            'commission' => round((float) ($totals->commission ?? 0), 2),
            'net' => round((float) ($totals->gross ?? 0) - (float) ($totals->commission ?? 0), 2),
            'bookings' => (int) ($totals->bookings ?? 0),
            'monthly' => $monthly,
        ];
    }

    /**
     * List payouts for a provider.
     *
     * @return array<int, array<string, mixed>>
     */
    public function payoutsList(Provider $provider): array
    {
        return Payout::query()
            ->where('provider_id', $provider->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Payout $payout) => [
                'id' => $payout->id,
                'period_start' => $payout->period_start?->toDateString(),
                'period_end' => $payout->period_end?->toDateString(),
                'gross_amount' => $payout->gross_amount,
                'commission' => $payout->commission,
                'net_amount' => $payout->net_amount,
                'status' => $payout->status,
                'payout_method' => $payout->payout_method,
                'transaction_ref' => $payout->transaction_ref,
                'paid_at' => $payout->paid_at?->toISOString(),
            ])
            ->toArray();
    }
}
