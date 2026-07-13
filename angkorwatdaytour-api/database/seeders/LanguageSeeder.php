<?php

namespace Database\Seeders;

use App\Models\Language;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LanguageSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $languages = [
            ['code' => 'en', 'label' => 'English', 'native_label' => 'English', 'sort_order' => 1],
            ['code' => 'km', 'label' => 'Khmer', 'native_label' => 'ភាសាខ្មែរ', 'sort_order' => 2],
            ['code' => 'fr', 'label' => 'French', 'native_label' => 'Français', 'sort_order' => 3],
        ];

        foreach ($languages as $language) {
            Language::firstOrCreate(
                ['code' => $language['code']],
                array_merge($language, ['is_active' => true])
            );
        }
    }
}
