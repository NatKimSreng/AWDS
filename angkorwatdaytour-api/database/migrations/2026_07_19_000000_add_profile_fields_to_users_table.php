<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->date('date_of_birth')->nullable()->after('avatar_url');
            $table->string('country', 100)->nullable()->after('date_of_birth');
            $table->string('nationality', 100)->nullable()->after('country');
            $table->text('address')->nullable()->after('nationality');
            $table->text('bio')->nullable()->after('address');
            $table->string('emergency_contact_name', 255)->nullable()->after('bio');
            $table->string('emergency_contact_phone', 30)->nullable()->after('emergency_contact_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'date_of_birth',
                'country',
                'nationality',
                'address',
                'bio',
                'emergency_contact_name',
                'emergency_contact_phone',
            ]);
        });
    }
};
