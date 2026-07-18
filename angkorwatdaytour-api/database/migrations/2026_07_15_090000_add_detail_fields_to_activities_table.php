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
        Schema::table('activities', function (Blueprint $table) {
            $table->text('what_to_bring')->nullable()->after('exclusions');
            $table->text('not_allowed')->nullable()->after('what_to_bring');
            $table->text('know_before_you_go')->nullable()->after('not_allowed');
            $table->text('additional_info')->nullable()->after('know_before_you_go');
            $table->text('not_suitable_for')->nullable()->after('additional_info');
            $table->boolean('is_refundable')->default(true)->after('is_instant_book');
            $table->unsignedSmallInteger('free_cancellation_hours')->default(24)->after('is_refundable');
            $table->text('weather_policy')->nullable()->after('free_cancellation_hours');
            $table->text('start_time_flexibility')->nullable()->after('weather_policy');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->dropColumn([
                'what_to_bring',
                'not_allowed',
                'know_before_you_go',
                'additional_info',
                'not_suitable_for',
                'is_refundable',
                'free_cancellation_hours',
                'weather_policy',
                'start_time_flexibility',
            ]);
        });
    }
};
