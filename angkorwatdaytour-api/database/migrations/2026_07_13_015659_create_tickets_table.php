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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->string('ticket_ref', 32)->unique();
            $table->json('qr_payload');
            $table->string('status', 30)->default('active'); // active, used, cancelled
            $table->timestamp('used_at')->nullable();
            $table->timestamps();

            $table->index('booking_id');
            $table->index('ticket_ref');
            $table->index('status');
        });
    }

    /**
     * Reverse the migration.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
