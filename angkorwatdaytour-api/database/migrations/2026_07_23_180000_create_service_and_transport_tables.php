<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');           // e.g. "Photography", "Rental", "Shared Tour"
            $table->string('slug')->unique();  // e.g. "photography", "rental", "shared-tour"
            $table->string('icon')->nullable(); // Lucide icon name
            $table->text('description')->nullable();
            $table->string('badge_color')->nullable()->default('#111827'); // Tailwind / hex
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('slug');
            $table->index('is_active');
        });

        Schema::create('activity_service_type', function (Blueprint $table) {
            $table->foreignId('activity_id')->constrained('activities')->onDelete('cascade');
            $table->foreignId('service_type_id')->constrained('service_types')->onDelete('cascade');
            $table->primary(['activity_id', 'service_type_id']);
        });

        Schema::create('transport_modes', function (Blueprint $table) {
            $table->id();
            $table->string('name');            // e.g. "Tuk-tuk", "Airplane", "Moto"
            $table->string('slug')->unique();  // e.g. "tuk-tuk", "airplane", "moto"
            $table->string('icon')->nullable(); // e.g. "car", "plane", "bike"
            $table->text('description')->nullable();
            $table->string('badge_color')->nullable()->default('#111827');
            $table->enum('category', ['land', 'air', 'water', 'other'])->default('land');
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('slug');
            $table->index('is_active');
            $table->index('category');
        });

        Schema::create('activity_transport_mode', function (Blueprint $table) {
            $table->foreignId('activity_id')->constrained('activities')->onDelete('cascade');
            $table->foreignId('transport_mode_id')->constrained('transport_modes')->onDelete('cascade');
            $table->primary(['activity_id', 'transport_mode_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_transport_mode');
        Schema::dropIfExists('transport_modes');
        Schema::dropIfExists('activity_service_type');
        Schema::dropIfExists('service_types');
    }
};
