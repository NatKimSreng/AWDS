<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CurrencyLanguageApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\LanguageSeeder']);
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\CurrencySeeder']);
    }

    public function test_public_settings_returns_currencies_and_languages(): void
    {
        $response = $this->getJson('/api/public/settings');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'currencies' => ['*' => ['code', 'label', 'symbol', 'exchange_rate_to_usd', 'is_default']],
                    'languages' => ['*' => ['code', 'label', 'native_label']],
                    'defaults' => ['currency', 'language'],
                ],
            ])
            ->assertJsonPath('data.defaults.currency', 'USD');
    }

    public function test_exchange_convert_returns_converted_amount(): void
    {
        $response = $this->postJson('/api/public/exchange/convert', [
            'amount' => 100,
            'from' => 'USD',
            'to' => 'KHR',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.from', 'USD')
            ->assertJsonPath('data.to', 'KHR')
            ->assertJsonPath('data.from', 'USD')
            ->assertJsonPath('data.to', 'KHR');

        $amount = $response->json('data.amount');
        $this->assertIsFloat($amount);
        $this->assertGreaterThan(0, $amount);
    }

    public function test_exchange_convert_rejects_invalid_currency(): void
    {
        $response = $this->postJson('/api/public/exchange/convert', [
            'amount' => 10,
            'from' => 'USD',
            'to' => 'XYZ',
        ]);

        $response->assertUnprocessable();
    }
}
