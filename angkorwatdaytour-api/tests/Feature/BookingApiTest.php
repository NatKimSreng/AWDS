<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Models\City;
use App\Models\Provider;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class BookingApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\RoleSeeder']);
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\LanguageSeeder']);
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\CurrencySeeder']);
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\ActivityCategorySeeder']);
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\CitySeeder']);
    }

    public function test_public_can_check_activity_availability(): void
    {
        $activity = $this->createLiveActivity();
        $date = now()->addDay()->toDateString();

        TimeSlot::factory()->create([
            'activity_id' => $activity->id,
            'date' => $date,
            'start_time' => '08:00:00',
            'end_time' => '12:00:00',
            'capacity' => 8,
            'booked_count' => 3,
        ]);

        $response = $this->getJson("/api/public/activities/{$activity->slug}/availability?date={$date}");

        $response->assertOk()
            ->assertJsonPath('data.activity.slug', $activity->slug)
            ->assertJsonPath('data.dates.0.date', $date)
            ->assertJsonPath('data.dates.0.slots.0.remaining', 5)
            ->assertJsonStructure([
                'data' => [
                    'activity' => ['id', 'title', 'slug', 'min_group', 'max_group', 'duration_minutes', 'base_price_usd'],
                    'dates' => ['*' => ['date', 'slots' => ['*' => ['id', 'start_time', 'end_time', 'capacity', 'booked_count', 'remaining']]]],
                ],
            ]);
    }

    public function test_availability_excludes_blackout_and_past_slots(): void
    {
        $activity = $this->createLiveActivity();

        TimeSlot::factory()->create([
            'activity_id' => $activity->id,
            'date' => now()->subDay()->toDateString(),
            'is_blackout' => false,
        ]);

        TimeSlot::factory()->blackout()->create([
            'activity_id' => $activity->id,
            'date' => now()->addDay()->toDateString(),
        ]);

        $availableDate = now()->addDay()->toDateString();
        TimeSlot::factory()->create([
            'activity_id' => $activity->id,
            'date' => $availableDate,
            'is_blackout' => false,
        ]);

        $response = $this->getJson("/api/public/activities/{$activity->slug}/availability");

        $response->assertOk()
            ->assertJsonCount(1, 'data.dates')
            ->assertJsonPath('data.dates.0.date', $availableDate);
    }

    public function test_authenticated_customer_can_create_a_booking(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;
        $activity = $this->createLiveActivity(['base_price_usd' => 25, 'max_group' => 6]);
        $slot = TimeSlot::factory()->create([
            'activity_id' => $activity->id,
            'date' => now()->addDay()->toDateString(),
            'capacity' => 6,
            'booked_count' => 0,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/bookings', [
                'activity_id' => $activity->id,
                'time_slot_id' => $slot->id,
                'traveler_count' => 2,
                'currency' => 'USD',
                'special_requests' => 'Vegetarian lunch please.',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.total_price', '50.00')
            ->assertJsonPath('data.traveler_count', 2)
            ->assertJsonPath('data.currency', 'USD')
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id', 'booking_ref', 'status', 'activity', 'time_slot',
                    'traveler_count', 'total_price', 'currency', 'expires_at',
                ],
            ]);

        $this->assertDatabaseHas('bookings', [
            'user_id' => $user->id,
            'activity_id' => $activity->id,
            'time_slot_id' => $slot->id,
            'traveler_count' => 2,
            'total_price' => 50.00,
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('booking_status_histories', [
            'status' => 'pending',
            'note' => 'Booking created, awaiting payment.',
        ]);

        $slot->refresh();
        $this->assertEquals(2, $slot->booked_count);
    }

    public function test_booking_is_rejected_when_not_enough_capacity(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;
        $activity = $this->createLiveActivity(['max_group' => 10]);
        $slot = TimeSlot::factory()->create([
            'activity_id' => $activity->id,
            'date' => now()->addDay()->toDateString(),
            'capacity' => 3,
            'booked_count' => 2,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/bookings', [
                'activity_id' => $activity->id,
                'time_slot_id' => $slot->id,
                'traveler_count' => 3,
            ]);

        $response->assertUnprocessable()
            ->assertJsonPath('remaining', 1)
            ->assertJsonPath('message', 'Not enough seats available for the selected time slot.');

        $slot->refresh();
        $this->assertEquals(2, $slot->booked_count);
    }

    public function test_booking_rejects_invalid_traveler_count(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;
        $activity = $this->createLiveActivity(['min_group' => 2, 'max_group' => 4]);
        $slot = TimeSlot::factory()->create([
            'activity_id' => $activity->id,
            'date' => now()->addDay()->toDateString(),
            'capacity' => 10,
        ]);

        $tooFew = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/bookings', [
                'activity_id' => $activity->id,
                'time_slot_id' => $slot->id,
                'traveler_count' => 1,
            ]);

        $tooFew->assertUnprocessable()
            ->assertJsonPath('message', 'This activity requires at least 2 travelers.');

        $tooMany = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/bookings', [
                'activity_id' => $activity->id,
                'time_slot_id' => $slot->id,
                'traveler_count' => 5,
            ]);

        $tooMany->assertUnprocessable()
            ->assertJsonPath('message', 'This activity allows at most 4 travelers per booking.');
    }

    public function test_booking_requires_authentication(): void
    {
        $activity = $this->createLiveActivity();
        $slot = TimeSlot::factory()->create([
            'activity_id' => $activity->id,
            'date' => now()->addDay()->toDateString(),
        ]);

        $response = $this->postJson('/api/bookings', [
            'activity_id' => $activity->id,
            'time_slot_id' => $slot->id,
            'traveler_count' => 1,
        ]);

        $response->assertUnauthorized();
    }

    public function test_booking_rejects_blackout_or_past_slots(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;
        $activity = $this->createLiveActivity();

        $pastSlot = TimeSlot::factory()->create([
            'activity_id' => $activity->id,
            'date' => now()->subDay()->toDateString(),
        ]);

        $blackoutSlot = TimeSlot::factory()->blackout()->create([
            'activity_id' => $activity->id,
            'date' => now()->addDay()->toDateString(),
        ]);

        $pastResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/bookings', [
                'activity_id' => $activity->id,
                'time_slot_id' => $pastSlot->id,
                'traveler_count' => 1,
            ]);

        $pastResponse->assertUnprocessable()
            ->assertJsonPath('message', 'Selected time slot is not available.');

        $blackoutResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/bookings', [
                'activity_id' => $activity->id,
                'time_slot_id' => $blackoutSlot->id,
                'traveler_count' => 1,
            ]);

        $blackoutResponse->assertUnprocessable()
            ->assertJsonPath('message', 'Selected time slot is not available.');
    }

    public function test_slot_lock_prevents_overbooking_in_race_condition(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;
        $activity = $this->createLiveActivity(['max_group' => 4]);
        $slot = TimeSlot::factory()->create([
            'activity_id' => $activity->id,
            'date' => now()->addDay()->toDateString(),
            'capacity' => 4,
            'booked_count' => 0,
        ]);

        // Acquire the slot lock externally to simulate another booking in progress.
        $lock = Cache::lock("booking:slot:{$slot->id}", 10);
        $this->assertTrue($lock->get());

        try {
            $response = $this->withHeader('Authorization', 'Bearer '.$token)
                ->postJson('/api/bookings', [
                    'activity_id' => $activity->id,
                    'time_slot_id' => $slot->id,
                    'traveler_count' => 2,
                ]);

            $response->assertStatus(409)
                ->assertJsonPath('message', 'This slot is being booked by another traveler. Please try again.');
        } finally {
            $lock->release();
        }

        $slot->refresh();
        $this->assertEquals(0, $slot->booked_count);
    }

    private function createLiveActivity(array $overrides = []): Activity
    {
        $providerUser = User::factory()->asProvider()->create();
        $provider = Provider::factory()->approved()->create(['user_id' => $providerUser->id]);

        return Activity::factory()->live()->create(array_merge([
            'provider_id' => $provider->id,
            'category_id' => ActivityCategory::inRandomOrder()->first()?->id ?? 1,
            'city_id' => City::inRandomOrder()->first()?->id ?? 1,
        ], $overrides));
    }
}
