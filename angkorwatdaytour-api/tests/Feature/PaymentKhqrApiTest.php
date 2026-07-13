<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Models\Booking;
use App\Models\City;
use App\Models\Payment;
use App\Models\Provider;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class PaymentKhqrApiTest extends TestCase
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

        Config::set('services.bakong.account_id', 'platform@devb');
        Config::set('services.bakong.merchant_name', 'AngkorWatDayTour Test');
        Config::set('services.bakong.merchant_city', 'Siem Reap');
        Config::set('services.bakong.webhook_secret', 'test-secret');
    }

    public function test_authenticated_user_can_generate_khqr_for_pending_booking(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;
        $booking = $this->createPendingBooking($user);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/bookings/{$booking->id}/payments/khqr");

        $response->assertOk()
            ->assertJsonPath('data.booking_ref', $booking->booking_ref)
            ->assertJsonStructure([
                'data' => [
                    'payment_id', 'booking_ref', 'qr', 'md5', 'amount', 'currency', 'expires_at',
                ],
            ]);

        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'method' => 'khqr',
            'status' => 'pending',
            'amount' => $booking->total_price,
            'currency' => $booking->currency,
        ]);
    }

    public function test_khqr_generation_rejects_non_owner(): void
    {
        $owner = User::factory()->asCustomer()->create();
        $other = User::factory()->asCustomer()->create();
        $token = $other->createToken('test')->plainTextToken;
        $booking = $this->createPendingBooking($owner);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/bookings/{$booking->id}/payments/khqr");

        $response->assertForbidden();
    }

    public function test_khqr_generation_rejects_non_pending_booking(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;
        $booking = $this->createPendingBooking($user);
        $booking->update(['status' => 'confirmed']);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/bookings/{$booking->id}/payments/khqr");

        $response->assertUnprocessable()
            ->assertJsonPath('status', 'confirmed');
    }

    public function test_khqr_status_polling_returns_current_status(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;
        $booking = $this->createPendingBooking($user);
        $payment = Payment::factory()->create([
            'booking_id' => $booking->id,
            'method' => 'khqr',
            'provider_ref' => md5('test-qr'),
            'status' => 'pending',
            'amount' => $booking->total_price,
            'currency' => $booking->currency,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/payments/{$payment->id}/khqr-status");

        $response->assertOk()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.booking_status', 'pending');
    }

    public function test_khqr_webhook_marks_payment_as_paid(): void
    {
        $user = User::factory()->asCustomer()->create();
        $booking = $this->createPendingBooking($user);
        $payment = Payment::factory()->create([
            'booking_id' => $booking->id,
            'method' => 'khqr',
            'provider_ref' => 'abc123def45678901234567890123456',
            'status' => 'pending',
            'amount' => $booking->total_price,
            'currency' => $booking->currency,
        ]);

        $payload = [
            'md5' => $payment->provider_ref,
            'status' => 'success',
            'transaction_id' => 'TXN-123',
            'amount' => $payment->amount,
            'currency' => $payment->currency,
        ];
        $signature = hash_hmac('sha256', json_encode($payload), 'test-secret');

        $response = $this->withHeader('X-Bakong-Signature', $signature)
            ->postJson('/api/payments/khqr/webhook', $payload);

        $response->assertOk()
            ->assertJsonPath('message', 'Webhook processed.');

        $payment->refresh();
        $booking->refresh();

        $this->assertEquals('paid', $payment->status);
        $this->assertNotNull($payment->paid_at);
        $this->assertEquals('confirmed', $booking->status);
        $this->assertEquals('khqr', $booking->payment_method);
        $this->assertNotNull($booking->confirmed_at);

        $this->assertDatabaseHas('booking_status_histories', [
            'booking_id' => $booking->id,
            'status' => 'confirmed',
            'note' => 'KHQR payment received.',
        ]);
    }

    public function test_khqr_webhook_rejects_invalid_signature(): void
    {
        $user = User::factory()->asCustomer()->create();
        $booking = $this->createPendingBooking($user);
        $payment = Payment::factory()->create([
            'booking_id' => $booking->id,
            'method' => 'khqr',
            'provider_ref' => 'abc123def45678901234567890123456',
            'status' => 'pending',
        ]);

        $response = $this->withHeader('X-Bakong-Signature', 'invalid-signature')
            ->postJson('/api/payments/khqr/webhook', [
                'md5' => $payment->provider_ref,
                'status' => 'success',
            ]);

        $response->assertUnauthorized();

        $payment->refresh();
        $this->assertEquals('pending', $payment->status);
    }

    private function createPendingBooking(User $user): Booking
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
            'status' => 'pending',
            'expires_at' => now()->addMinutes(15),
        ]);
    }
}
