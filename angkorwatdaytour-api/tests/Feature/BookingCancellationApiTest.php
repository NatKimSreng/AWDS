<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Models\Booking;
use App\Models\City;
use App\Models\Payment;
use App\Models\Provider;
use App\Models\Ticket;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingCancellationApiTest extends TestCase
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

    public function test_preview_shows_full_refund_more_than_24_hours_before_start(): void
    {
        [$user, $booking, $token] = $this->createConfirmedPaidBooking(startsInHours: 48);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/bookings/{$booking->id}/cancellation-preview");

        $response->assertOk()
            ->assertJsonPath('data.can_cancel', true)
            ->assertJsonPath('data.refund_eligible', true)
            ->assertJsonPath('data.refund_policy', 'full_refund')
            ->assertJsonPath('data.refund_amount', 50);
    }

    public function test_preview_shows_no_refund_within_24_hours(): void
    {
        [$user, $booking, $token] = $this->createConfirmedPaidBooking(startsInHours: 12);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/bookings/{$booking->id}/cancellation-preview");

        $response->assertOk()
            ->assertJsonPath('data.can_cancel', true)
            ->assertJsonPath('data.refund_eligible', false)
            ->assertJsonPath('data.refund_policy', 'no_refund')
            ->assertJsonPath('data.refund_amount', 0);
    }

    public function test_preview_rejects_after_start_time(): void
    {
        [$user, $booking, $token] = $this->createConfirmedPaidBooking(startsInHours: -2);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/bookings/{$booking->id}/cancellation-preview");

        $response->assertOk()
            ->assertJsonPath('data.can_cancel', false)
            ->assertJsonPath('data.refund_policy', 'none');
    }

    public function test_non_owner_cannot_preview_or_cancel(): void
    {
        [$owner, $booking] = $this->createConfirmedPaidBooking(startsInHours: 48);
        $other = User::factory()->asCustomer()->create();
        $token = $other->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/bookings/{$booking->id}/cancellation-preview")
            ->assertForbidden();

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/bookings/{$booking->id}/cancel")
            ->assertForbidden();
    }

    public function test_cancel_pending_booking_creates_no_refund_and_restores_capacity(): void
    {
        [$user, $booking, $token, $slot] = $this->createPendingBooking();

        $this->assertEquals(2, $slot->fresh()->booked_count);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/bookings/{$booking->id}/cancel", ['reason' => 'Plans changed']);

        $response->assertOk()
            ->assertJsonPath('data.booking.status', 'cancelled')
            ->assertJsonPath('data.refund', null);

        $booking->refresh();
        $this->assertEquals('cancelled', $booking->status);
        $this->assertNotNull($booking->cancelled_at);
        $this->assertEquals(0, $slot->fresh()->booked_count);

        $this->assertDatabaseHas('booking_status_histories', [
            'booking_id' => $booking->id,
            'status' => 'cancelled',
            'note' => 'Customer cancelled: Plans changed',
        ]);
    }

    public function test_cancel_confirmed_paid_booking_more_than_24_hours_creates_refund(): void
    {
        [$user, $booking, $token, $slot] = $this->createConfirmedPaidBookingWithSlot(startsInHours: 48);
        Ticket::factory()->create(['booking_id' => $booking->id, 'status' => 'active']);

        $this->assertEquals(2, $slot->fresh()->booked_count);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/bookings/{$booking->id}/cancel");

        $response->assertOk()
            ->assertJsonPath('data.booking.status', 'cancelled')
            ->assertJsonPath('data.refund.amount', 50)
            ->assertJsonPath('data.refund.status', 'pending');

        $this->assertDatabaseHas('refunds', [
            'booking_id' => $booking->id,
            'amount' => $booking->total_price,
            'status' => 'pending',
        ]);

        $this->assertEquals(0, $slot->fresh()->booked_count);
        $this->assertEquals('cancelled', $booking->fresh()->ticket->status);
    }

    public function test_cancel_confirmed_paid_booking_within_24_hours_creates_no_refund(): void
    {
        [$user, $booking, $token, $slot] = $this->createConfirmedPaidBookingWithSlot(startsInHours: 12);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/bookings/{$booking->id}/cancel")
            ->assertOk()
            ->assertJsonPath('data.booking.status', 'cancelled')
            ->assertJsonPath('data.refund', null);

        $this->assertDatabaseMissing('refunds', ['booking_id' => $booking->id]);
        $this->assertEquals(0, $slot->fresh()->booked_count);
    }

    public function test_cancel_already_cancelled_booking_is_rejected(): void
    {
        [$user, $booking, $token] = $this->createConfirmedPaidBooking(startsInHours: 48);
        $booking->update(['status' => 'cancelled', 'cancelled_at' => now()]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/bookings/{$booking->id}/cancel")
            ->assertUnprocessable();
    }

    private function createPendingBooking(): array
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;

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
            'booked_count' => 2,
        ]);

        $booking = Booking::factory()->create([
            'user_id' => $user->id,
            'activity_id' => $activity->id,
            'time_slot_id' => $slot->id,
            'booking_date' => $slot->date,
            'booking_time' => $slot->start_time,
            'traveler_count' => 2,
            'total_price' => 50,
            'currency' => 'USD',
            'status' => 'pending',
        ]);

        return [$user, $booking, $token, $slot];
    }

    private function createConfirmedPaidBooking(int $startsInHours): array
    {
        [$user, $booking, $token, $slot] = $this->createConfirmedPaidBookingWithSlot($startsInHours);

        return [$user, $booking, $token];
    }

    private function createConfirmedPaidBookingWithSlot(int $startsInHours): array
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;

        $providerUser = User::factory()->asProvider()->create();
        $provider = Provider::factory()->approved()->create(['user_id' => $providerUser->id]);
        $activity = Activity::factory()->live()->create([
            'provider_id' => $provider->id,
            'base_price_usd' => 25,
            'max_group' => 6,
        ]);

        $start = now()->addHours($startsInHours);
        $slot = TimeSlot::factory()
            ->forDate($start->toDateString(), (int) $start->format('G'))
            ->create([
                'activity_id' => $activity->id,
                'capacity' => 6,
                'booked_count' => 2,
            ]);

        $booking = Booking::factory()->create([
            'user_id' => $user->id,
            'activity_id' => $activity->id,
            'time_slot_id' => $slot->id,
            'booking_date' => $slot->date,
            'booking_time' => $slot->start_time,
            'traveler_count' => 2,
            'total_price' => 50,
            'currency' => 'USD',
            'status' => 'confirmed',
            'confirmed_at' => now()->subHour(),
        ]);

        Payment::factory()->create([
            'booking_id' => $booking->id,
            'method' => 'khqr',
            'status' => 'paid',
            'amount' => $booking->total_price,
            'currency' => $booking->currency,
            'paid_at' => now()->subHour(),
        ]);

        return [$user, $booking, $token, $slot];
    }
}
