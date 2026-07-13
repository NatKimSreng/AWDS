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
        Schema::create('providers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->string('business_name');
            $table->text('bio')->nullable();
            $table->text('service_area')->nullable();
            $table->string('verification_status', 30)->default('pending'); // pending, approved, rejected, suspended
            $table->string('id_document_url')->nullable();
            $table->string('license_document_url')->nullable();
            $table->decimal('avg_rating', 2, 1)->default(0);
            $table->unsignedInteger('total_bookings')->default(0);
            $table->decimal('commission_rate', 5, 2)->default(5.00);
            $table->boolean('is_featured')->default(false);
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->index('verification_status');
            $table->index('is_featured');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('providers');
    }
};
