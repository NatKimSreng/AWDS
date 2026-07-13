<?php

namespace Tests\Feature;

use App\Mail\BookingConfirmationMail;
use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Models\Booking;
use App\Models\City;
use App\Models\Provider;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class TicketApiTest extends TestCase
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

    public function test_authenticated_user_can_fetch_ticket_for_booking(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;
        $booking = $this->createBooking($user, 'confirmed');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/bookings/{$booking->id}/ticket");

        $response->assertOk()
            ->assertJsonPath('data.booking_ref', $booking->booking_ref)
            ->assertJsonStructure([
                'data' => [
                    'ticket_ref', 'booking_ref', 'status', 'booking_status', 'activity',
                    'date', 'time', 'travelers', 'total_price', 'currency', 'qr_data_uri', 'qr_payload', 'provider',
                ],
            ]);

        $this->assertDatabaseHas('tickets', [
            'booking_id' => $booking->id,
        ]);
    }

    public function test_ticket_is_reused_for_subsequent_requests(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;
        $booking = $this->createBooking($user, 'confirmed');

        $first = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/bookings/{$booking->id}/ticket")
            ->json('data.ticket_ref');

        $second = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/bookings/{$booking->id}/ticket")
            ->json('data.ticket_ref');

        $this->assertEquals($first, $second);
        $this->assertDatabaseCount('tickets', 1);
    }

    public function test_ticket_endpoint_rejects_non_owner(): void
    {
        $owner = User::factory()->asCustomer()->create();
        $other = User::factory()->asCustomer()->create();
        $token = $other->createToken('test')->plainTextToken;
        $booking = $this->createBooking($owner, 'confirmed');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/bookings/{$booking->id}/ticket");

        $response->assertForbidden();
    }

    public function test_ticket_endpoint_rejects_cancelled_booking(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;
        $booking = $this->createBooking($user, 'cancelled');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/bookings/{$booking->id}/ticket");

        $response->assertUnprocessable()
            ->assertJsonPath('status', 'cancelled');
    }

    public function test_user_can_send_confirmation_email(): void
    {
        Mail::fake();

        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;
        $booking = $this->createBooking($user, 'confirmed');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/bookings/{$booking->id}/send-confirmation-email");

        $response->assertOk()
            ->assertJsonPath('message', 'Confirmation email queued.');

        Mail::assertQueued(BookingConfirmationMail::class, function (BookingConfirmationMail $mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    public function test_qr_payload_signature_is_verifiable(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;
        $booking = $this->createBooking($user, 'confirmed');

        $payload = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/bookings/{$booking->id}/ticket")
            ->json('data.qr_payload');

        $service = new \App\Services\TicketService();
        $this->assertTrue($service->verifyPayload($payload));

        $tampered = $payload;
        $tampered['travelers'] = 999;
        $this->assertFalse($service->verifyPayload($tampered));
    }

    private function createBooking(User $user, string $status): Booking
    {
        $providerUser = User::factory()->asProvider()->create();
        $provider = Provider::factory()->approved()->create(['user_id' => $providerUser->id]);
        $activity = Activity::factory()->live()->create([
            'provider_id' => $provider->id,
            'category_id' => ActivityCategory::inRandomOrder()->first()?->id ?? 1,
            'city_id' => City::inRandomOrder()->first()?->id ?? 1,
            'base_price_usd' => 25,
            'max_group' => 6,
        ]);

        $slot = TimeSlot::factory()->create([
            'activity_id' => $activity->id,
            'date' => now()->addDay()->toDateString(),
            'capacity' => 6,
        ]);

        return Booking::factory()->create([
            'user_id' => $user->id,
            'activity_id' => $activity->id,
            'time_slot_id' => $slot->id,
            'booking_date' => $slot->date,
            'booking_time' => $slot->start_time,
            'traveler_count' => 2,
            'total_price' => 50,
            'currency' => 'USD',
            'status' => $status,
            'confirmed_at' => $status === 'confirmed' ? now() : null,
            'expires_at' => now()->addMinutes(15),
        ]);
    }
}
