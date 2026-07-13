<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\Coupon;
use App\Models\Provider;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Coupon>
 */
class CouponFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => strtoupper(Str::random(8)),
            'type' => fake()->randomElement(['percent', 'fixed']),
            'value' => fn (array $attributes) => $attributes['type'] === 'percent' ? fake()->numberBetween(5, 30) : fake()->randomFloat(2, 5, 50),
            'min_spend' => fake()->randomFloat(2, 0, 50),
            'usage_limit' => fake()->optional()->numberBetween(10, 100),
            'used_count' => 0,
            'expires_at' => fake()->optional()->dateTimeBetween('+1 week', '+6 months'),
            'applies_to_provider_id' => fake()->optional()->randomElement(Provider::pluck('id')->toArray()),
            'applies_to_activity_id' => fake()->optional()->randomElement(Activity::pluck('id')->toArray()),
            'is_active' => true,
        ];
    }
}
