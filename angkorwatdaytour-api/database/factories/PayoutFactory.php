<?php

namespace Database\Factories;

use App\Models\Payout;
use App\Models\Provider;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payout>
 */
class PayoutFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $gross = fake()->randomFloat(2, 100, 5000);
        $commission = round($gross * 0.05, 2);
        $net = round($gross - $commission, 2);

        $periodStart = now()->subDays(fake()->numberBetween(1, 90));
        $periodEnd = (clone $periodStart)->addDays(13);

        return [
            'provider_id' => Provider::factory(),
            'period_start' => $periodStart->toDateString(),
            'period_end' => $periodEnd->toDateString(),
            'gross_amount' => $gross,
            'commission' => $commission,
            'net_amount' => $net,
            'status' => fake()->randomElement(['pending', 'pending', 'approved', 'paid']),
            'payout_method' => fake()->randomElement(['bank', 'aba', 'wing']),
            'transaction_ref' => fake()->optional()->regexify('[A-Z0-9]{10}'),
            'approved_by_id' => null,
            'approved_at' => null,
            'paid_at' => null,
        ];
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }
}
