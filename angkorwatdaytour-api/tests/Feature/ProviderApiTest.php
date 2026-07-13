<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Provider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProviderApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\ActivityCategorySeeder::class);
        $this->seed(\Database\Seeders\CitySeeder::class);
    }

    public function test_public_can_view_approved_provider_profile(): void
    {
        $provider = Provider::factory()->approved()->create([
            'business_name' => 'Angkor Discovery Tours',
            'bio' => 'Authentic local experiences.',
            'service_area' => 'Siem Reap',
            'avg_rating' => 4.7,
            'total_bookings' => 123,
        ]);

        Activity::factory()->count(2)->live()->create([
            'provider_id' => $provider->id,
            'title' => 'Sunrise Angkor Wat Tour',
        ]);

        Activity::factory()->count(1)->draft()->create([
            'provider_id' => $provider->id,
        ]);

        $response = $this->getJson(route('public.providers.show', $provider->id));

        $response->assertOk()
            ->assertJsonPath('data.business_name', 'Angkor Discovery Tours')
            ->assertJsonPath('data.bio', 'Authentic local experiences.')
            ->assertJsonPath('data.service_area', 'Siem Reap')
            ->assertJsonPath('data.avg_rating', 4.7)
            ->assertJsonPath('data.total_bookings', 123)
            ->assertJsonPath('data.activities_count', 3)
            ->assertJsonCount(2, 'data.activities')
            ->assertJsonPath('data.activities.0.title', 'Sunrise Angkor Wat Tour');
    }

    public function test_pending_provider_is_not_found(): void
    {
        $provider = Provider::factory()->pending()->create();

        $this->getJson(route('public.providers.show', $provider->id))
            ->assertNotFound();
    }
}
