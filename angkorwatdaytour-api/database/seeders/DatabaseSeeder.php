<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            LanguageSeeder::class,
            CurrencySeeder::class,
            ActivityCategorySeeder::class,
            ServiceAndTransportSeeder::class,
            CitySeeder::class,
            DemoDataSeeder::class,
        ]);
    }
}
