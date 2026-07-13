<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Models\ActivityImage;
use App\Models\Booking;
use App\Models\City;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicBrowsingApiTest extends TestCase
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

    public function test_public_can_list_categories(): void
    {
        $response = $this->getJson('/api/public/categories');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['*' => ['id', 'name', 'slug', 'children']]]);
    }

    public function test_public_can_list_cities(): void
    {
        $response = $this->getJson('/api/public/cities');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['*' => ['id', 'name', 'slug']]]);
    }

    public function test_public_can_list_live_activities(): void
    {
        Activity::factory()->live()->count(3)->create();
        Activity::factory()->draft()->count(2)->create();

        $response = $this->getJson('/api/public/activities');

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => ['*' => ['id', 'title', 'slug', 'base_price_usd', 'category', 'city', 'provider', 'hero_image']],
            ]);
    }

    public function test_activities_can_be_filtered_by_category_and_city(): void
    {
        $category = ActivityCategory::whereNotNull('id')->first();
        $city = City::whereNotNull('id')->first();

        Activity::factory()->live()->create([
            'category_id' => $category->id,
            'city_id' => $city->id,
            'title' => 'Matching Tour',
        ]);

        $otherCategory = ActivityCategory::where('id', '!=', $category->id)->first();
        $otherCity = City::where('id', '!=', $city->id)->first();

        Activity::factory()->live()->create([
            'category_id' => $otherCategory?->id ?? $category->id,
            'city_id' => $otherCity?->id ?? $city->id,
            'title' => 'Non-matching Tour',
        ]);

        $response = $this->getJson("/api/public/activities?category={$category->slug}&city={$city->slug}");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Matching Tour');
    }

    public function test_activities_can_be_sorted_by_price(): void
    {
        Activity::factory()->live()->create(['base_price_usd' => 100]);
        Activity::factory()->live()->create(['base_price_usd' => 50]);

        $response = $this->getJson('/api/public/activities?sort=price_asc');

        $response->assertOk()
            ->assertJsonPath('data.0.base_price_usd', '50.00');
    }

    public function test_public_can_view_activity_detail(): void
    {
        $customer = User::factory()->asCustomer()->create();
        $activity = Activity::factory()->live()->create(['title' => 'Sunrise Temple Tour']);
        ActivityImage::factory()->hero()->create(['activity_id' => $activity->id]);
        ActivityImage::factory()->count(2)->create(['activity_id' => $activity->id]);

        $bookings = Booking::factory()->completed()->count(2)->create([
            'user_id' => $customer->id,
            'activity_id' => $activity->id,
        ]);

        foreach ($bookings as $booking) {
            Review::factory()->create([
                'booking_id' => $booking->id,
                'user_id' => $customer->id,
                'activity_id' => $activity->id,
                'is_verified' => true,
            ]);
        }

        $response = $this->getJson("/api/public/activities/{$activity->slug}");

        $response->assertOk()
            ->assertJsonPath('data.title', 'Sunrise Temple Tour')
            ->assertJsonStructure([
                'data' => [
                    'id', 'title', 'slug', 'description', 'itinerary', 'inclusions',
                    'exclusions', 'meeting_point', 'duration_minutes', 'min_group',
                    'max_group', 'base_price_usd', 'spoken_languages', 'is_instant_book',
                    'avg_rating', 'reviews_count', 'category', 'city', 'provider',
                    'hero_image', 'gallery', 'reviews',
                ],
            ]);
    }

    public function test_public_search_returns_results_for_matching_term(): void
    {
        Activity::factory()->live()->create(['title' => 'Angkor Wat Sunrise Photo Tour']);

        $response = $this->getJson('/api/public/search?q=angkor');

        $response->assertOk()
            ->assertJsonPath('data.activities.0.title', 'Angkor Wat Sunrise Photo Tour');
    }
}
