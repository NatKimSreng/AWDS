<?php

namespace Database\Factories;

use App\Models\Role;
use App\Helpers\SeederImageHelper;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->optional()->phoneNumber(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'role_id' => Role::where('name', Role::CUSTOMER)->firstOrFail()->id,
            'language_pref' => fake()->randomElement(['en', 'km']),
            'avatar_url' => fake()->boolean(70) ? SeederImageHelper::peopleImageUrl(256, 256) : null,
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function asCustomer(): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => Role::where('name', Role::CUSTOMER)->firstOrFail()->id,
        ]);
    }

    public function asProvider(): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => Role::where('name', Role::PROVIDER)->firstOrFail()->id,
        ]);
    }

    public function asAdmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => Role::where('name', Role::ADMIN)->firstOrFail()->id,
        ]);
    }
}
