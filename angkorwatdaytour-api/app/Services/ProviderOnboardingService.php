<?php

namespace App\Services;

use App\Models\Provider;
use App\Models\ProviderPayoutAccount;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

class ProviderOnboardingService
{
    public function __construct(
        private readonly ImageUploadService $imageUploadService
    ) {
    }

    public const STATUS_STARTED = 'started';
    public const STATUS_SUBMITTED = 'submitted';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    /**
     * Get or create the provider onboarding record for a user.
     */
    public function getOrCreateApplication(User $user): Provider
    {
        $provider = Provider::query()->where('user_id', $user->id)->first();

        if ($provider) {
            return $provider;
        }

        return Provider::create([
            'user_id' => $user->id,
            'business_name' => '',
            'verification_status' => 'pending',
            'onboarding_status' => self::STATUS_STARTED,
            'commission_rate' => config('commission.rate', 5.00),
        ]);
    }

    /**
     * Save business information.
     *
     * @param array<string, mixed> $data
     */
    public function saveBusinessInfo(User $user, array $data): Provider
    {
        $provider = $this->getOrCreateApplication($user);

        $provider->update([
            'business_name' => $data['business_name'],
            'bio' => $data['bio'] ?? null,
            'service_area' => $data['service_area'] ?? null,
            'onboarding_status' => $provider->onboarding_status ?? self::STATUS_STARTED,
        ]);

        return $provider->fresh();
    }

    /**
     * Save verification documents.
     *
     * @param array<string, UploadedFile|null> $files
     */
    public function saveDocuments(User $user, array $files): Provider
    {
        $provider = $this->getOrCreateApplication($user);

        $updates = [];

        if (! empty($files['id_document']) && $files['id_document'] instanceof UploadedFile) {
            $updates['id_document_url'] = $this->imageUploadService->store($files['id_document'], 'providers/id_documents');
        }

        if (! empty($files['license_document']) && $files['license_document'] instanceof UploadedFile) {
            $updates['license_document_url'] = $this->imageUploadService->store($files['license_document'], 'providers/license_documents');
        }

        if ($updates) {
            $provider->update($updates);
        }

        return $provider->fresh();
    }

    /**
     * Save payout account details.
     *
     * @param array<string, mixed> $data
     */
    public function savePayoutAccount(User $user, array $data): Provider
    {
        $provider = $this->getOrCreateApplication($user);

        ProviderPayoutAccount::query()
            ->where('provider_id', $provider->id)
            ->update(['is_default' => false]);

        ProviderPayoutAccount::create([
            'provider_id' => $provider->id,
            'method' => $data['method'],
            'account_name' => $data['account_name'],
            'account_number' => $data['account_number'],
            'is_default' => true,
        ]);

        return $provider->fresh(['payoutAccounts']);
    }

    /**
     * Submit the onboarding application for admin review.
     */
    public function submit(User $user): Provider
    {
        $provider = $this->getOrCreateApplication($user);

        $this->validateReadyForSubmission($provider);

        $provider->update([
            'onboarding_status' => self::STATUS_SUBMITTED,
            'verification_status' => 'pending',
        ]);

        return $provider->fresh(['payoutAccounts']);
    }

    private function validateReadyForSubmission(Provider $provider): void
    {
        $errors = [];

        if (blank($provider->business_name)) {
            $errors['business_name'] = 'Business name is required.';
        }

        if (blank($provider->id_document_url)) {
            $errors['id_document'] = 'ID document is required.';
        }

        $hasPayoutAccount = ProviderPayoutAccount::query()
            ->where('provider_id', $provider->id)
            ->exists();

        if (! $hasPayoutAccount) {
            $errors['payout_account'] = 'Payout account is required.';
        }

        if ($errors) {
            throw ValidationException::withMessages($errors);
        }
    }
}
