<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['name' => 'customer', 'label' => 'Customer', 'description' => 'Book tours and manage their own bookings'],
            ['name' => 'provider', 'label' => 'Provider', 'description' => 'List tours, manage availability, and view earnings'],
            ['name' => 'admin', 'label' => 'Admin', 'description' => 'Full platform management'],
        ];

        foreach ($roles as $role) {
            \App\Models\Role::firstOrCreate(
                ['name' => $role['name']],
                ['label' => $role['label'], 'description' => $role['description']]
            );
        }
    }
}
