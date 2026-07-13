<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ProviderOnboardingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProviderOnboardingController extends Controller
{
    public function __construct(
        private readonly ProviderOnboardingService $onboardingService
    ) {
    }

    public function show(Request $request): JsonResponse
    {
        $provider = $this->onboardingService->getOrCreateApplication($request->user());

        return response()->json([
            'data' => $this->mapProvider($provider),
        ]);
    }

    public function saveBusiness(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'business_name' => ['required', 'string', 'max:200'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'service_area' => ['nullable', 'string', 'max:500'],
        ]);

        $provider = $this->onboardingService->saveBusinessInfo($request->user(), $validated);

        return response()->json([
            'message' => 'Business information saved.',
            'data' => $this->mapProvider($provider),
        ]);
    }

    public function saveDocuments(Request $request): JsonResponse
    {
        $request->validate([
            'id_document' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            'license_document' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        $files = [
            'id_document' => $request->file('id_document'),
            'license_document' => $request->file('license_document'),
        ];

        $provider = $this->onboardingService->saveDocuments($request->user(), $files);

        return response()->json([
            'message' => 'Documents saved.',
            'data' => $this->mapProvider($provider),
        ]);
    }

    public function savePayout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'method' => ['required', 'string', 'in:bank,aba,wing'],
            'account_name' => ['required', 'string', 'max:200'],
            'account_number' => ['required', 'string', 'max:100'],
        ]);

        $provider = $this->onboardingService->savePayoutAccount($request->user(), $validated);

        return response()->json([
            'message' => 'Payout account saved.',
            'data' => $this->mapProvider($provider),
        ]);
    }

    public function submit(Request $request): JsonResponse
    {
        try {
            $provider = $this->onboardingService->submit($request->user());
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Application incomplete.', 'errors' => $e->errors()], 422);
        }

        return response()->json([
            'message' => 'Application submitted. We will review your details and get back to you soon.',
            'data' => $this->mapProvider($provider),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function mapProvider($provider): array
    {
        return [
            'id' => $provider->id,
            'business_name' => $provider->business_name,
            'bio' => $provider->bio,
            'service_area' => $provider->service_area,
            'verification_status' => $provider->verification_status,
            'onboarding_status' => $provider->onboarding_status,
            'id_document_url' => $provider->id_document_url,
            'license_document_url' => $provider->license_document_url,
            'commission_rate' => $provider->commission_rate,
            'payout_accounts' => $provider->payoutAccounts?->map(fn ($account) => [
                'id' => $account->id,
                'method' => $account->method,
                'account_name' => $account->account_name,
                'account_number' => $account->account_number,
                'is_default' => $account->is_default,
            ]),
        ];
    }
}
