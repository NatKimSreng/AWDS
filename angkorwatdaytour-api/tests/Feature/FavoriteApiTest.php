<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Models\City;
use App\Models\Favorite;
use App\Models\Provider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FavoriteApiTest extends TestCase
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

    public function test_authenticated_customer_can_favorite_activity(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;
        $providerUser = User::factory()->asProvider()->create();
        $provider = Provider::factory()->approved()->create(['user_id' => $providerUser->id]);
        $activity = Activity::factory()->live()->create(['provider_id' => $provider->id]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/favorites', ['activity_id' => $activity->id])
            ->assertCreated()
            ->assertJsonPath('data.is_favorite', true);

        $this->assertDatabaseHas('favorites', [
            'user_id' => $user->id,
            'activity_id' => $activity->id,
        ]);
    }

    public function test_repeating_favorite_request_removes_it(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;
        $providerUser = User::factory()->asProvider()->create();
        $provider = Provider::factory()->approved()->create(['user_id' => $providerUser->id]);
        $activity = Activity::factory()->live()->create(['provider_id' => $provider->id]);

        Favorite::create(['user_id' => $user->id, 'activity_id' => $activity->id]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/favorites', ['activity_id' => $activity->id])
            ->assertOk()
            ->assertJsonPath('data.is_favorite', false);

        $this->assertDatabaseMissing('favorites', [
            'user_id' => $user->id,
            'activity_id' => $activity->id,
        ]);
    }

    public function test_favorite_list_returns_user_favorites(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;
        $other = User::factory()->asCustomer()->create();

        $providerUser = User::factory()->asProvider()->create();
        $provider = Provider::factory()->approved()->create(['user_id' => $providerUser->id]);

        $favorited = Activity::factory()->live()->create(['provider_id' => $provider->id, 'title' => 'Favorited Tour']);
        $otherActivity = Activity::factory()->live()->create(['provider_id' => $provider->id, 'title' => 'Other Tour']);

        Favorite::create(['user_id' => $user->id, 'activity_id' => $favorited->id]);
        Favorite::create(['user_id' => $other->id, 'activity_id' => $otherActivity->id]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/favorites')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.activity.title', 'Favorited Tour');
    }

    public function test_favorite_status_endpoint(): void
    {
        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;
        $providerUser = User::factory()->asProvider()->create();
        $provider = Provider::factory()->approved()->create(['user_id' => $providerUser->id]);
        $activity = Activity::factory()->live()->create(['provider_id' => $provider->id]);

        Favorite::create(['user_id' => $user->id, 'activity_id' => $activity->id]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/activities/{$activity->id}/favorite")
            ->assertOk()
            ->assertJsonPath('data.is_favorite', true);
    }

    public function test_unauthenticated_requests_are_rejected(): void
    {
        $this->postJson('/api/favorites', ['activity_id' => 1])
            ->assertUnauthorized();
    }
}
