<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Booking;
use App\Models\City;
use App\Models\Provider;
use App\Models\Payout;
use App\Models\TimeSlot;
use App\Models\User;
use Database\Seeders\ActivityCategorySeeder;
use Database\Seeders\CitySeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class VendorApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([
            RoleSeeder::class,
            ActivityCategorySeeder::class,
            CitySeeder::class,
        ]);
    }

    private function approvedProviderToken(): array
    {
        $user = User::factory()->asProvider()->create();
        $provider = Provider::factory()->onboardingApproved()->create([
            'user_id' => $user->id,
        ]);
        $token = $user->createToken('test')->plainTextToken;

        return [$user, $provider, $token];
    }

    public function test_unauthenticated_requests_are_rejected(): void
    {
        $this->getJson(route('vendor.dashboard'))
            ->assertUnauthorized();
    }

    public function test_non_provider_is_rejected(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson(route('vendor.dashboard'))
            ->assertForbidden();
    }

    public function test_unapproved_provider_is_rejected(): void
    {
        $user = User::factory()->asProvider()->create();
        Provider::factory()->create([
            'user_id' => $user->id,
            'verification_status' => 'pending',
            'onboarding_status' => 'submitted',
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson(route('vendor.dashboard'))
            ->assertForbidden()
            ->assertJsonPath('message', 'Unauthorized. Provider account is not approved.');
    }

    public function test_dashboard_returns_provider_stats(): void
    {
        [$user, $provider, $token] = $this->approvedProviderToken();

        $activity = Activity::factory()->create([
            'provider_id' => $provider->id,
            'status' => 'live',
        ]);
        $slot = TimeSlot::factory()->create([
            'activity_id' => $activity->id,
            'capacity' => 10,
            'booked_count' => 0,
        ]);
        Booking::factory()->confirmed()->create([
            'activity_id' => $activity->id,
            'time_slot_id' => $slot->id,
            'total_price' => 100,
            'commission_amount' => 5,
        ]);
        $slot->increment('booked_count');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson(route('vendor.dashboard'));

        $response->assertOk()
            ->assertJsonPath('data.total_listings', 1)
            ->assertJsonPath('data.total_bookings', 1)
            ->assertJsonPath('data.total_earnings_gross', 100)
            ->assertJsonPath('data.current_balance', 95);
    }

    public function test_provider_can_list_their_listings(): void
    {
        [$user, $provider, $token] = $this->approvedProviderToken();
        $activity = Activity::factory()->create([
            'provider_id' => $provider->id,
            'title' => 'Sunrise Tour',
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson(route('vendor.listings.index'))
            ->assertOk()
            ->assertJsonPath('data.0.title', 'Sunrise Tour');
    }

    public function test_provider_cannot_see_other_providers_listings(): void
    {
        [$user, $provider, $token] = $this->approvedProviderToken();
        $otherProvider = Provider::factory()->onboardingApproved()->create();
        Activity::factory()->create([
            'provider_id' => $otherProvider->id,
            'title' => 'Secret Tour',
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson(route('vendor.listings.index'))
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_provider_can_create_listing(): void
    {
        Storage::fake('public');
        [$user, $provider, $token] = $this->approvedProviderToken();

        $category = \App\Models\ActivityCategory::first();
        $city = City::first();

        $hero = UploadedFile::fake()->image('hero.jpg');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('vendor.listings.store'), [
                'title' => 'New Sunset Tour',
                'category_id' => $category->id,
                'city_id' => $city->id,
                'description' => 'A lovely tour.',
                'duration_minutes' => 180,
                'max_group' => 8,
                'base_price_usd' => 45,
                'status' => 'draft',
                'hero_image' => $hero,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'New Sunset Tour')
            ->assertJsonPath('data.status', 'draft');

        Storage::disk('public')->assertExists('activities/hero/'.$hero->hashName());
    }

    public function test_provider_cannot_set_listing_status_to_live(): void
    {
        [$user, $provider, $token] = $this->approvedProviderToken();

        $category = \App\Models\ActivityCategory::first();

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('vendor.listings.store'), [
                'title' => 'Live Attempt',
                'category_id' => $category->id,
                'duration_minutes' => 180,
                'max_group' => 8,
                'base_price_usd' => 45,
                'status' => 'live',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_provider_can_update_own_listing(): void
    {
        [$user, $provider, $token] = $this->approvedProviderToken();
        $activity = Activity::factory()->create([
            'provider_id' => $provider->id,
            'title' => 'Old Title',
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson(route('vendor.listings.update', $activity->id), [
                'title' => 'Updated Title',
                'category_id' => $activity->category_id,
                'duration_minutes' => $activity->duration_minutes,
                'max_group' => $activity->max_group,
                'base_price_usd' => $activity->base_price_usd,
            ])
            ->assertOk()
            ->assertJsonPath('data.title', 'Updated Title');
    }

    public function test_provider_cannot_update_other_providers_listing(): void
    {
        [$user, $provider, $token] = $this->approvedProviderToken();
        $otherProvider = Provider::factory()->onboardingApproved()->create();
        $activity = Activity::factory()->create([
            'provider_id' => $otherProvider->id,
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson(route('vendor.listings.update', $activity->id), [
                'title' => 'Hacked',
                'category_id' => $activity->category_id,
                'duration_minutes' => $activity->duration_minutes,
                'max_group' => $activity->max_group,
                'base_price_usd' => $activity->base_price_usd,
            ])
            ->assertForbidden();
    }

    public function test_provider_can_create_time_slot(): void
    {
        [$user, $provider, $token] = $this->approvedProviderToken();
        $activity = Activity::factory()->create([
            'provider_id' => $provider->id,
            'duration_minutes' => 120,
        ]);

        $date = now()->addDay()->toDateString();

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('vendor.listings.slots.store', $activity->id), [
                'date' => $date,
                'start_time' => '08:00',
                'end_time' => '10:00',
                'capacity' => 10,
            ])
            ->assertCreated()
            ->assertJsonPath('data.capacity', 10);
    }

    public function test_bulk_slot_creation_is_capped_at_90_days(): void
    {
        [$user, $provider, $token] = $this->approvedProviderToken();
        $activity = Activity::factory()->create([
            'provider_id' => $provider->id,
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('vendor.listings.slots.bulk', $activity->id), [
                'date_from' => now()->toDateString(),
                'date_to' => now()->addDays(100)->toDateString(),
                'start_time' => '08:00',
                'capacity' => 5,
                'days' => [0, 1, 2, 3, 4, 5, 6],
            ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Bulk creation is limited to 90 days.');
    }

    public function test_provider_can_view_bookings_for_their_activities(): void
    {
        [$user, $provider, $token] = $this->approvedProviderToken();
        $activity = Activity::factory()->create(['provider_id' => $provider->id]);
        $slot = TimeSlot::factory()->create(['activity_id' => $activity->id]);
        $booking = Booking::factory()->confirmed()->create([
            'activity_id' => $activity->id,
            'time_slot_id' => $slot->id,
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson(route('vendor.bookings.index'))
            ->assertOk()
            ->assertJsonPath('data.0.booking_ref', $booking->booking_ref);
    }

    public function test_provider_can_confirm_pending_booking(): void
    {
        [$user, $provider, $token] = $this->approvedProviderToken();
        $activity = Activity::factory()->create(['provider_id' => $provider->id]);
        $slot = TimeSlot::factory()->create(['activity_id' => $activity->id]);
        $booking = Booking::factory()->create([
            'activity_id' => $activity->id,
            'time_slot_id' => $slot->id,
            'status' => 'pending',
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('vendor.bookings.status', $booking->id), [
                'status' => 'confirmed',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'confirmed');

        $this->assertDatabaseHas('booking_status_histories', [
            'booking_id' => $booking->id,
            'status' => 'confirmed',
            'changed_by_type' => 'provider',
        ]);
    }

    public function test_provider_can_cancel_confirmed_booking(): void
    {
        [$user, $provider, $token] = $this->approvedProviderToken();
        $activity = Activity::factory()->create(['provider_id' => $provider->id]);
        $slot = TimeSlot::factory()->create([
            'activity_id' => $activity->id,
            'capacity' => 10,
            'booked_count' => 2,
        ]);
        $booking = Booking::factory()->confirmed()->create([
            'activity_id' => $activity->id,
            'time_slot_id' => $slot->id,
            'traveler_count' => 2,
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('vendor.bookings.status', $booking->id), [
                'status' => 'cancelled',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $slot->refresh();
        $this->assertEquals(0, $slot->booked_count);
    }

    public function test_invalid_booking_status_transition_is_rejected(): void
    {
        [$user, $provider, $token] = $this->approvedProviderToken();
        $activity = Activity::factory()->create(['provider_id' => $provider->id]);
        $slot = TimeSlot::factory()->create(['activity_id' => $activity->id]);
        $booking = Booking::factory()->cancelled()->create([
            'activity_id' => $activity->id,
            'time_slot_id' => $slot->id,
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('vendor.bookings.status', $booking->id), [
                'status' => 'confirmed',
            ])
            ->assertStatus(422);
    }

    public function test_earnings_endpoint_returns_summary(): void
    {
        [$user, $provider, $token] = $this->approvedProviderToken();
        $activity = Activity::factory()->create(['provider_id' => $provider->id]);
        $slot = TimeSlot::factory()->create(['activity_id' => $activity->id]);
        Booking::factory()->confirmed()->create([
            'activity_id' => $activity->id,
            'time_slot_id' => $slot->id,
            'total_price' => 200,
            'commission_amount' => 10,
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson(route('vendor.earnings.index'))
            ->assertOk()
            ->assertJsonPath('data.gross', 200)
            ->assertJsonPath('data.commission', 10)
            ->assertJsonPath('data.net', 190);
    }

    public function test_payouts_endpoint_returns_provider_payouts(): void
    {
        [$user, $provider, $token] = $this->approvedProviderToken();
        Payout::factory()->create([
            'provider_id' => $provider->id,
            'status' => 'paid',
            'gross_amount' => 500,
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson(route('vendor.payouts.index'))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'paid');
    }

    public function test_settings_update_changes_business_info(): void
    {
        [$user, $provider, $token] = $this->approvedProviderToken();

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson(route('vendor.settings.update'), [
                'business_name' => 'New Business Name',
                'bio' => 'Updated bio.',
                'service_area' => 'Updated area',
            ])
            ->assertOk()
            ->assertJsonPath('data.business_name', 'New Business Name');

        $this->assertDatabaseHas('providers', [
            'id' => $provider->id,
            'business_name' => 'New Business Name',
        ]);
    }

    public function test_settings_payout_update_creates_default_account(): void
    {
        [$user, $provider, $token] = $this->approvedProviderToken();

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson(route('vendor.settings.payout.update'), [
                'method' => 'aba',
                'account_name' => 'Sok Dara',
                'account_number' => '123456',
            ])
            ->assertOk()
            ->assertJsonPath('data.method', 'aba');

        $this->assertDatabaseHas('provider_payout_accounts', [
            'provider_id' => $provider->id,
            'is_default' => true,
        ]);
    }
}
