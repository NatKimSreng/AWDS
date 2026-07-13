<?php

namespace Tests\Feature;

use App\Models\Provider;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProviderOnboardingApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_user_can_fetch_or_create_onboarding_application(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson(route('provider.onboarding.show'));

        $response->assertOk()
            ->assertJsonPath('data.onboarding_status', 'started');

        $this->assertDatabaseHas('providers', [
            'user_id' => $user->id,
            'onboarding_status' => 'started',
        ]);
    }

    public function test_user_can_save_business_info(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('provider.onboarding.business'), [
                'business_name' => 'Angkor Trails',
                'bio' => 'Local guided tours of Angkor.',
                'service_area' => 'Siem Reap',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.business_name', 'Angkor Trails')
            ->assertJsonPath('data.service_area', 'Siem Reap');
    }

    public function test_business_info_requires_name(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('provider.onboarding.business'), [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['business_name']);
    }

    public function test_user_can_upload_documents(): void
    {
        Storage::fake('public');

        $user = User::factory()->asCustomer()->create();
        Provider::factory()->create([
            'user_id' => $user->id,
            'business_name' => 'Angkor Trails',
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $idDocument = UploadedFile::fake()->image('id.jpg');
        $licenseDocument = UploadedFile::fake()->image('license.jpg');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('provider.onboarding.documents'), [
                'id_document' => $idDocument,
                'license_document' => $licenseDocument,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.id_document_url', fn ($url) => str_contains($url, 'providers/id_documents'));

        Storage::disk('public')->assertExists('providers/id_documents/'.$idDocument->hashName());
    }

    public function test_id_document_is_required_for_upload_step(): void
    {
        $user = User::factory()->asCustomer()->create();
        Provider::factory()->create(['user_id' => $user->id]);
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('provider.onboarding.documents'), [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['id_document']);
    }

    public function test_user_can_save_payout_account(): void
    {
        $user = User::factory()->asCustomer()->create();
        Provider::factory()->create(['user_id' => $user->id]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('provider.onboarding.payout'), [
                'method' => 'aba',
                'account_name' => 'Sokha Dara',
                'account_number' => '123456789',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.payout_accounts.0.method', 'aba');

        $this->assertDatabaseHas('provider_payout_accounts', [
            'account_name' => 'Sokha Dara',
            'account_number' => '123456789',
            'is_default' => true,
        ]);
    }

    public function test_user_can_submit_complete_application(): void
    {
        Storage::fake('public');

        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('provider.onboarding.business'), [
                'business_name' => 'Angkor Trails',
            ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('provider.onboarding.documents'), [
                'id_document' => UploadedFile::fake()->image('id.jpg'),
            ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('provider.onboarding.payout'), [
                'method' => 'aba',
                'account_name' => 'Sokha Dara',
                'account_number' => '123456789',
            ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('provider.onboarding.submit'))
            ->assertOk()
            ->assertJsonPath('data.onboarding_status', 'submitted');
    }

    public function test_submit_rejects_incomplete_application(): void
    {
        $user = User::factory()->asCustomer()->create();
        Provider::factory()->create([
            'user_id' => $user->id,
            'business_name' => '',
            'id_document_url' => null,
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('provider.onboarding.submit'))
            ->assertStatus(422)
            ->assertJsonPath('errors.business_name', ['Business name is required.']);
    }

    public function test_unauthenticated_requests_are_rejected(): void
    {
        $this->getJson(route('provider.onboarding.show'))
            ->assertUnauthorized();
    }
}
