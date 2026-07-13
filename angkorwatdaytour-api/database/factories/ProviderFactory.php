<?php

namespace Database\Factories;

use App\Models\Provider;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Provider>
 */
class ProviderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->asProvider(),
            'business_name' => fake()->company(),
            'bio' => fake()->paragraphs(2, true),
            'service_area' => fake()->randomElement(['Siem Reap Central', 'Angkor Park', 'Tonlé Sap', 'Rural Siem Reap']),
            'verification_status' => fake()->randomElement(['pending', 'approved', 'approved', 'approved']),
            'id_document_url' => fake()->optional()->imageUrl(800, 600, 'business'),
            'license_document_url' => fake()->optional()->imageUrl(800, 600, 'business'),
            'avg_rating' => fake()->randomFloat(1, 3, 5),
            'total_bookings' => fake()->numberBetween(0, 500),
            'commission_rate' => 5.00,
            'is_featured' => fake()->boolean(20),
            'approved_at' => fn (array $attributes) => $attributes['verification_status'] === 'approved' ? now() : null,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => 'approved',
            'onboarding_status' => 'approved',
            'approved_at' => now(),
        ]);
    }

    public function onboardingApproved(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => 'approved',
            'onboarding_status' => 'approved',
            'approved_at' => now(),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => 'pending',
            'approved_at' => null,
        ]);
    }
}
