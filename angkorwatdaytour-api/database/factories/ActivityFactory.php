<?php

namespace Database\Factories;

use App\Models\ActivityCategory;
use App\Models\City;
use App\Models\Provider;
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

        return [
            'provider_id' => Provider::factory(),
            'category_id' => ActivityCategory::inRandomOrder()->first()->id ?? 1,
            'city_id' => City::inRandomOrder()->first()->id ?? 1,
            'title' => $title,
            'slug' => Str::slug($title) . '-' . fake()->unique()->numberBetween(1000, 9999),
            'description' => fake()->paragraphs(4, true),
            'itinerary_json' => [
                ['time' => '05:00', 'description' => 'Hotel pickup in Siem Reap'],
                ['time' => '05:30', 'description' => 'Sunrise at Angkor Wat'],
                ['time' => '08:00', 'description' => 'Breakfast break'],
                ['time' => '09:30', 'description' => 'Explore Bayon and Ta Prohm'],
                ['time' => '12:00', 'description' => 'Return to hotel'],
            ],
            'inclusions' => fake()->paragraph(2),
            'exclusions' => fake()->paragraph(2),
            'meeting_point_address' => fake()->address(),
            'meeting_point_lat' => fake()->latitude(13.30, 13.45),
            'meeting_point_lng' => fake()->longitude(103.80, 103.95),
            'duration_minutes' => fake()->randomElement([120, 180, 240, 300, 480]),
            'min_group' => 1,
            'max_group' => fake()->randomElement([1, 2, 4, 6, 8, 12]),
            'base_price_usd' => fake()->randomFloat(2, 15, 250),
            'status' => fake()->randomElement(['live', 'live', 'live', 'draft', 'pending']),
            'is_featured' => fake()->boolean(15),
            'is_instant_book' => fake()->boolean(80),
            'spoken_languages' => fake()->randomElements(['en', 'km', 'fr'], fake()->numberBetween(1, 3)),
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
