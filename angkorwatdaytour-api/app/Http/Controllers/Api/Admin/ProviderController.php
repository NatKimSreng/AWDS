<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Provider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProviderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'approved', 'rejected'])],
            'query' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Provider::query()
            ->with('user:id,name,email')
            ->orderByDesc('created_at');

        if (! empty($validated['status'])) {
            $query->where('verification_status', $validated['status']);
        }

        if (! empty($validated['query'])) {
            $term = $validated['query'];
            $query->where(function ($q) use ($term) {
                $q->where('business_name', 'like', "%{$term}%")
                    ->orWhereHas('user', function ($uq) use ($term) {
                        $uq->where('name', 'like', "%{$term}%")
                            ->orWhere('email', 'like', "%{$term}%");
                    });
            });
        }

        return response()->json(
            $query->paginate((int) ($validated['per_page'] ?? 20))
                ->through(fn (Provider $provider) => $this->mapProvider($provider))
        );
    }

    public function show(Request $request, Provider $provider): JsonResponse
    {
        $provider->loadMissing(['user', 'activities', 'payoutAccounts']);

        return response()->json([
            'data' => [
                ...$this->mapProvider($provider),
                'bio' => $provider->bio,
                'service_area' => $provider->service_area,
                'commission_rate' => $provider->commission_rate,
                'total_bookings' => $provider->total_bookings,
                'avg_rating' => $provider->avg_rating,
                'approved_at' => $provider->approved_at?->toISOString(),
                'activities_count' => $provider->activities->count(),
                'payout_accounts' => $provider->payoutAccounts->map(fn ($account) => $account->only(['id', 'method', 'account_name', 'account_number', 'is_default']))->values(),
            ],
        ]);
    }

    public function approve(Request $request, Provider $provider): JsonResponse
    {
        $provider->update([
            'verification_status' => 'approved',
            'onboarding_status' => 'approved',
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Provider approved.',
            'data' => $this->mapProvider($provider->fresh()),
        ]);
    }

    public function reject(Request $request, Provider $provider): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $provider->update([
            'verification_status' => 'rejected',
            'onboarding_status' => 'rejected',
            'approved_at' => null,
        ]);

        return response()->json([
            'message' => 'Provider rejected.',
            'data' => $this->mapProvider($provider->fresh()),
        ]);
    }

    public function toggleFeatured(Request $request, Provider $provider): JsonResponse
    {
        $provider->update([
            'is_featured' => ! $provider->is_featured,
        ]);

        return response()->json([
            'message' => 'Provider featured status updated.',
            'data' => $this->mapProvider($provider->fresh()),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function mapProvider(Provider $provider): array
    {
        return [
            'id' => $provider->id,
            'business_name' => $provider->business_name,
            'verification_status' => $provider->verification_status,
            'onboarding_status' => $provider->onboarding_status,
            'is_featured' => $provider->is_featured,
            'avg_rating' => $provider->avg_rating,
            'total_bookings' => $provider->total_bookings,
            'commission_rate' => $provider->commission_rate,
            'user' => $provider->user ? $provider->user->only(['id', 'name', 'email']) : null,
            'created_at' => $provider->created_at?->toISOString(),
            'approved_at' => $provider->approved_at?->toISOString(),
        ];
    }
}
