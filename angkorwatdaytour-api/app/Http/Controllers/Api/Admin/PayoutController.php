<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payout;
use App\Models\Provider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PayoutController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'processing', 'paid', 'failed'])],
            'provider_id' => ['nullable', 'integer', 'exists:providers,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Payout::query()
            ->with('provider:id,business_name')
            ->orderByDesc('created_at');

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (! empty($validated['provider_id'])) {
            $query->where('provider_id', $validated['provider_id']);
        }

        return response()->json($query->paginate((int) ($validated['per_page'] ?? 20)));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider_id' => ['required', 'integer', 'exists:providers,id'],
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date', 'after_or_equal:period_start'],
            'payout_method' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $provider = Provider::query()->findOrFail($validated['provider_id']);

        $totals = Booking::query()
            ->where('activity_id', function ($query) use ($provider) {
                $query->select('id')
                    ->from('activities')
                    ->where('provider_id', $provider->id);
            })
            ->whereIn('status', ['confirmed', 'completed'])
            ->whereBetween('confirmed_at', [$validated['period_start'], $validated['period_end']])
            ->selectRaw('sum(total_price) as gross, sum(commission_amount) as commission')
            ->first();

        $gross = (float) ($totals->gross ?? 0);
        $commission = (float) ($totals->commission ?? 0);
        $net = $gross - $commission;

        $payout = Payout::create([
            'provider_id' => $provider->id,
            'period_start' => $validated['period_start'],
            'period_end' => $validated['period_end'],
            'gross_amount' => $gross,
            'commission' => $commission,
            'net_amount' => $net,
            'status' => 'pending',
            'payout_method' => $validated['payout_method'] ?? null,
            'transaction_ref' => null,
        ]);

        return response()->json([
            'message' => 'Payout record created.',
            'data' => $payout->fresh('provider'),
        ], 201);
    }

    public function markPaid(Request $request, Payout $payout): JsonResponse
    {
        $validated = $request->validate([
            'transaction_ref' => ['nullable', 'string', 'max:255'],
        ]);

        $payout->update([
            'status' => 'paid',
            'paid_at' => now(),
            'transaction_ref' => $validated['transaction_ref'] ?? $payout->transaction_ref,
        ]);

        return response()->json([
            'message' => 'Payout marked as paid.',
            'data' => $payout->fresh('provider'),
        ]);
    }
}
