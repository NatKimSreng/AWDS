<?php

namespace Database\Factories;

use App\Models\ActivityCategory;
use App\Models\City;
use App\Models\Provider;
use App\Helpers\ActivityContentHelper;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Activity>
 */
class ActivityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(4);
        $category = ActivityCategory::inRandomOrder()->first();
        $city = City::inRandomOrder()->first();

        $content = ActivityContentHelper::forTheme([
            'title' => $title,
            'category_slug' => $category?->slug ?? 'temples-history',
            'city_slug' => $city?->slug ?? 'siem-reap-central',
            'duration_minutes' => fake()->randomElement([120, 180, 240, 300, 480]),
            'max_group' => fake()->randomElement([1, 2, 4, 6, 8, 12]),
            'base_price' => fake()->randomFloat(2, 15, 250),
        ]);

        return [
            'provider_id' => Provider::factory(),
            'category_id' => $category?->id ?? 1,
            'city_id' => $city?->id ?? 1,
            'title' => $title,
            'slug' => Str::slug($title) . '-' . fake()->unique()->numberBetween(1000, 9999),
            'description' => $content['description'],
            'itinerary_json' => $content['itinerary_json'],
            'inclusions' => $content['inclusions'],
            'exclusions' => $content['exclusions'],
            'what_to_bring' => $content['what_to_bring'],
            'not_allowed' => $content['not_allowed'],
            'know_before_you_go' => $content['know_before_you_go'],
            'additional_info' => $content['additional_info'],
            'not_suitable_for' => $content['not_suitable_for'],
            'weather_policy' => $content['weather_policy'],
            'start_time_flexibility' => $content['start_time_flexibility'],
            'meeting_point_address' => $content['meeting_point_address'],
            'meeting_point_lat' => fake()->latitude(13.30, 13.45),
            'meeting_point_lng' => fake()->longitude(103.80, 103.95),
            'duration_minutes' => fake()->randomElement([120, 180, 240, 300, 480]),
            'min_group' => 1,
            'max_group' => fake()->randomElement([1, 2, 4, 6, 8, 12]),
            'base_price_usd' => fake()->randomFloat(2, 15, 250),
            'status' => fake()->randomElement(['live', 'live', 'live', 'draft', 'pending']),
            'is_featured' => fake()->boolean(15),
            'is_instant_book' => fake()->boolean(80),
            'is_refundable' => $content['is_refundable'],
            'free_cancellation_hours' => $content['free_cancellation_hours'],
            'spoken_languages' => $content['spoken_languages'],
            'published_at' => now()->subDays(fake()->numberBetween(1, 90)),
        ];
    }

    public function live(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'live',
            'published_at' => now()->subDay(),
        ]);
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
            'published_at' => null,
        ]);
    }
}
