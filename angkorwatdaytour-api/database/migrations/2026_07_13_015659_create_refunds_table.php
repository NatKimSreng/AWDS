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
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained('payments')->onDelete('cascade');
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->string('reason')->nullable();
            $table->string('status', 30)->default('pending'); // pending, approved, rejected, processed
            $table->unsignedBigInteger('processed_by_id')->nullable();
            $table->string('processed_by_type', 50)->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index('payment_id');
            $table->index('booking_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};
