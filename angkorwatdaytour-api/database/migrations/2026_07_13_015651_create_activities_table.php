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
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_id')->constrained('providers')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('activity_categories')->onDelete('restrict');
            $table->foreignId('city_id')->nullable()->constrained('cities')->onDelete('set null');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('itinerary_json')->nullable();
            $table->text('inclusions')->nullable();
            $table->text('exclusions')->nullable();
            $table->string('meeting_point_address')->nullable();
            $table->decimal('meeting_point_lat', 10, 8)->nullable();
            $table->decimal('meeting_point_lng', 11, 8)->nullable();
            $table->unsignedInteger('duration_minutes')->default(60);
            $table->unsignedSmallInteger('min_group')->default(1);
            $table->unsignedSmallInteger('max_group')->default(1);
            $table->decimal('base_price_usd', 10, 2)->default(0);
            $table->string('status', 30)->default('draft'); // draft, pending, live, paused
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_instant_book')->default(true);
            $table->json('spoken_languages')->nullable(); // ["en", "km"]
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index('slug');
            $table->index('provider_id');
            $table->index('category_id');
            $table->index('city_id');
            $table->index('status');
            $table->index('is_featured');
            $table->fullText(['title', 'description']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
