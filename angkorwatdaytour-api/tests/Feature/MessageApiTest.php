<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Models\Booking;
use App\Models\City;
use App\Models\Message;
use App\Models\MessageThread;
use App\Models\Provider;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageApiTest extends TestCase
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

    public function test_customer_can_create_thread_from_booking(): void
    {
        [$customer, $booking, $token] = $this->createBooking();

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/bookings/{$booking->id}/message-threads")
            ->assertCreated()
            ->assertJsonPath('data.subject', "Booking {$booking->booking_ref}");

        $this->assertDatabaseHas('message_threads', [
            'booking_id' => $booking->id,
            'customer_id' => $customer->id,
        ]);
    }

    public function test_create_thread_returns_existing_thread_if_present(): void
    {
        [$customer, $booking, $token] = $this->createBooking();

        MessageThread::factory()->create([
            'booking_id' => $booking->id,
            'customer_id' => $customer->id,
            'provider_id' => $booking->activity->provider_id,
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/bookings/{$booking->id}/message-threads")
            ->assertOk()
            ->assertJsonPath('message', 'Thread already exists.');
    }

    public function test_non_owner_cannot_create_thread(): void
    {
        [$owner, $booking] = $this->createBooking();
        $other = User::factory()->asCustomer()->create();
        $token = $other->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/bookings/{$booking->id}/message-threads")
            ->assertForbidden();
    }

    public function test_participant_can_send_message(): void
    {
        [$customer, $booking, $token] = $this->createBooking();

        $thread = MessageThread::factory()->create([
            'booking_id' => $booking->id,
            'customer_id' => $customer->id,
            'provider_id' => $booking->activity->provider_id,
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/message-threads/{$thread->id}/messages", [
                'body' => 'Hello, can we start 30 minutes later?',
            ])
            ->assertCreated()
            ->assertJsonPath('data.body', 'Hello, can we start 30 minutes later?')
            ->assertJsonPath('data.sender_type', 'user');

        $thread->refresh();
        $this->assertNotNull($thread->last_message_at);
    }

    public function test_non_participant_cannot_send_message(): void
    {
        [$customer, $booking] = $this->createBooking();
        $other = User::factory()->asCustomer()->create();
        $token = $other->createToken('test')->plainTextToken;

        $thread = MessageThread::factory()->create([
            'booking_id' => $booking->id,
            'customer_id' => $customer->id,
            'provider_id' => $booking->activity->provider_id,
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/message-threads/{$thread->id}/messages", [
                'body' => 'Intruder message',
            ])
            ->assertForbidden();
    }

    public function test_participant_can_list_threads(): void
    {
        [$customer, $booking, $token] = $this->createBooking();

        MessageThread::factory()->create([
            'booking_id' => $booking->id,
            'customer_id' => $customer->id,
            'provider_id' => $booking->activity->provider_id,
            'last_message_at' => now(),
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/message-threads')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_mark_message_as_read(): void
    {
        [$customer, $booking, $token] = $this->createBooking();

        $thread = MessageThread::factory()->create([
            'booking_id' => $booking->id,
            'customer_id' => $customer->id,
            'provider_id' => $booking->activity->provider_id,
        ]);

        $message = Message::factory()->create([
            'thread_id' => $thread->id,
            'sender_id' => $booking->activity->provider_id,
            'sender_type' => 'provider',
            'recipient_id' => $customer->id,
            'recipient_type' => 'user',
            'read_at' => null,
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/message-threads/{$thread->id}/messages/{$message->id}/read")
            ->assertOk()
            ->assertJsonPath('data.read_at', fn (string $value) => ! empty($value));
    }

    private function createBooking(): array
    {
        $customer = User::factory()->asCustomer()->create();
        $token = $customer->createToken('test')->plainTextToken;

        $providerUser = User::factory()->asProvider()->create();
        $provider = Provider::factory()->approved()->create(['user_id' => $providerUser->id]);
        $activity = Activity::factory()->live()->create([
            'provider_id' => $provider->id,
            'base_price_usd' => 25,
            'max_group' => 6,
        ]);

        $slot = TimeSlot::factory()->create([
            'activity_id' => $activity->id,
            'date' => now()->addDay()->toDateString(),
            'capacity' => 6,
        ]);

        $booking = Booking::factory()->create([
            'user_id' => $customer->id,
            'activity_id' => $activity->id,
            'time_slot_id' => $slot->id,
            'booking_date' => $slot->date,
            'booking_time' => $slot->start_time,
            'traveler_count' => 2,
            'total_price' => 50,
            'currency' => 'USD',
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);

        return [$customer, $booking, $token];
    }
}
