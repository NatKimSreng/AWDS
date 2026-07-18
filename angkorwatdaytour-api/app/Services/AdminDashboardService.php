<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Provider;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminDashboardService
{
    /**
     * Build platform-wide admin dashboard stats.
     *
     * @return array<string, mixed>
     */
    public function stats(): array
    {
        $userCounts = User::query()
            ->selectRaw('count(*) as total')
            ->selectRaw("sum(case when role_id = (select id from roles where name = 'customer') then 1 else 0 end) as customers")
            ->selectRaw("sum(case when role_id = (select id from roles where name = 'provider') then 1 else 0 end) as providers")
            ->selectRaw("sum(case when role_id = (select id from roles where name = 'admin') then 1 else 0 end) as admins")
            ->first();

        $providerCounts = Provider::query()
            ->selectRaw("verification_status, count(*) as count")
            ->groupBy('verification_status')
            ->pluck('count', 'verification_status');

        $bookingCounts = Booking::query()
            ->selectRaw("status, count(*) as count")
            ->groupBy('status')
            ->pluck('count', 'status');

        $earnings = Booking::query()
            ->whereIn('status', ['confirmed', 'completed'])
            ->selectRaw('sum(total_price) as gross, sum(commission_amount) as commission')
            ->first();

        $pendingProviders = Provider::query()
            ->where('verification_status', 'pending')
            ->orWhere('onboarding_status', 'pending')
            ->with('user:id,name,email')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn (Provider $provider) => [
                'id' => $provider->id,
                'business_name' => $provider->business_name,
                'verification_status' => $provider->verification_status,
                'onboarding_status' => $provider->onboarding_status,
                'user' => $provider->user ? $provider->user->only(['id', 'name', 'email']) : null,
                'created_at' => $provider->created_at?->toISOString(),
            ]);

        $recentBookings = Booking::query()
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

        $monthlyRevenue = Booking::query()
            ->whereIn('status', ['confirmed', 'completed'])
            ->selectRaw("date_format(confirmed_at, '%Y-%m') as month, sum(total_price) as gross, sum(commission_amount) as commission, count(*) as bookings")
            ->groupBy('month')
            ->orderByDesc('month')
            ->limit(6)
            ->get()
            ->map(fn ($row) => [
                'month' => $row->month,
                'gross' => round((float) $row->gross, 2),
                'commission' => round((float) $row->commission, 2),
                'net' => round((float) $row->gross - (float) $row->commission, 2),
                'bookings' => (int) $row->bookings,
            ]);

        $gross = (float) ($earnings->gross ?? 0);
        $commission = (float) ($earnings->commission ?? 0);

        return [
            'total_users' => (int) ($userCounts->total ?? 0),
            'total_customers' => (int) ($userCounts->customers ?? 0),
            'total_providers' => (int) ($userCounts->providers ?? 0),
            'total_admins' => (int) ($userCounts->admins ?? 0),
            'pending_providers' => (int) ($providerCounts['pending'] ?? 0),
            'approved_providers' => (int) ($providerCounts['approved'] ?? 0),
            'rejected_providers' => (int) ($providerCounts['rejected'] ?? 0),
            'total_bookings' => (int) array_sum($bookingCounts->toArray()),
            'pending_bookings' => (int) ($bookingCounts['pending'] ?? 0),
            'confirmed_bookings' => (int) ($bookingCounts['confirmed'] ?? 0),
            'completed_bookings' => (int) ($bookingCounts['completed'] ?? 0),
            'cancelled_bookings' => (int) ($bookingCounts['cancelled'] ?? 0),
            'total_revenue_gross' => round($gross, 2),
            'total_commission' => round($commission, 2),
            'total_net' => round($gross - $commission, 2),
            'pending_provider_applications' => $pendingProviders,
            'recent_bookings' => $recentBookings,
            'monthly_revenue' => $monthlyRevenue,
        ];
    }
}
