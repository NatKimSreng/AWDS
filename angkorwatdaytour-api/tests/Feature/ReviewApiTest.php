<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Models\Booking;
use App\Models\City;
use App\Models\Provider;
use App\Models\Review;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ReviewApiTest extends TestCase
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

        Storage::fake('public');
    }

    public function test_eligibility_allows_review_for_completed_booking(): void
    {
        [$user, $booking, $token] = $this->createCompletedBooking();

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/bookings/{$booking->id}/reviews/eligibility");

        $response->assertOk()
            ->assertJsonPath('data.can_review', true)
            ->assertJsonPath('data.activity.id', $booking->activity_id);
    }

    public function test_eligibility_rejects_pending_booking(): void
    {
        [$user, $booking, $token] = $this->createBookingWithStatus('confirmed');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/bookings/{$booking->id}/reviews/eligibility");

        $response->assertOk()
            ->assertJsonPath('data.can_review', false)
            ->assertJsonPath('data.reason', 'Booking must be completed before leaving a review.');
    }

    public function test_eligibility_rejects_already_reviewed_booking(): void
    {
        [$user, $booking, $token] = $this->createCompletedBooking();

        Review::factory()->create([
            'booking_id' => $booking->id,
            'user_id' => $user->id,
            'activity_id' => $booking->activity_id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/bookings/{$booking->id}/reviews/eligibility");

        $response->assertOk()
            ->assertJsonPath('data.can_review', false)
            ->assertJsonPath('data.reason', 'You have already reviewed this booking.');
    }

    public function test_non_owner_cannot_check_eligibility_or_create_review(): void
    {
        [$owner, $booking] = $this->createCompletedBooking();
        $other = User::factory()->asCustomer()->create();
        $token = $other->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/bookings/{$booking->id}/reviews/eligibility")
            ->assertOk()
            ->assertJsonPath('data.can_review', false)
            ->assertJsonPath('data.reason', 'Unauthorized.');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/bookings/{$booking->id}/reviews", ['rating' => 5])
            ->assertUnprocessable();
    }

    public function test_customer_can_create_review_for_completed_booking(): void
    {
        [$user, $booking, $token] = $this->createCompletedBooking();

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/bookings/{$booking->id}/reviews", [
                'rating' => 5,
                'comment' => 'Great tour!',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.rating', 5)
            ->assertJsonPath('data.comment', 'Great tour!');

        $this->assertDatabaseHas('reviews', [
            'booking_id' => $booking->id,
            'user_id' => $user->id,
            'rating' => 5,
        ]);
    }

    public function test_review_creation_rejects_invalid_rating(): void
    {
        [$user, $booking, $token] = $this->createCompletedBooking();

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/bookings/{$booking->id}/reviews", ['rating' => 6])
            ->assertUnprocessable();

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/bookings/{$booking->id}/reviews", ['rating' => 0])
            ->assertUnprocessable();
    }

    public function test_review_creation_stores_images(): void
    {
        [$user, $booking, $token] = $this->createCompletedBooking();

        $image = UploadedFile::fake()->image('review.jpg', 800, 600)->size(100);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/bookings/{$booking->id}/reviews", [
                'rating' => 4,
                'comment' => 'Lovely photos attached.',
                'images' => [$image],
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.images.0.sort_order', 0)
            ->assertJsonPath('data.images.0.url', fn (string $url) => str_contains($url, 'reviews/'));

        Storage::disk('public')->assertExists('reviews/'.$image->hashName());
    }

    public function test_public_reviews_are_listed_for_activity(): void
    {
        [$user, $booking] = $this->createCompletedBooking();

        Review::factory()->create([
            'booking_id' => $booking->id,
            'user_id' => $user->id,
            'activity_id' => $booking->activity_id,
            'rating' => 5,
            'comment' => 'Public review',
        ]);

        $slug = $booking->activity->slug;

        $this->getJson("/api/public/activities/{$slug}/reviews")
            ->assertOk()
            ->assertJsonPath('data.0.rating', 5)
            ->assertJsonPath('data.0.comment', 'Public review');
    }

    public function test_review_updates_activity_average_rating(): void
    {
        [$user, $booking, $token] = $this->createCompletedBooking();

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/bookings/{$booking->id}/reviews", [
                'rating' => 5,
                'comment' => 'Excellent!',
            ]);

        $booking->activity->provider->refresh();

        $this->assertEquals(5.0, (float) $booking->activity->provider->avg_rating);
    }

    private function createCompletedBooking(): array
    {
        return $this->createBookingWithStatus('completed');
    }

    private function createBookingWithStatus(string $status): array
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
            'date' => now()->subDay()->toDateString(),
            'capacity' => 6,
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
            'status' => $status,
            'confirmed_at' => $status !== 'pending' ? now()->subDays(2) : null,
        ]);

        return [$user, $booking, $token];
    }
}
