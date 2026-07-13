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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_ref', 32)->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('guest_email')->nullable();
            $table->string('guest_name')->nullable();
            $table->string('guest_phone')->nullable();
            $table->foreignId('activity_id')->constrained('activities')->onDelete('restrict');
            $table->foreignId('time_slot_id')->nullable()->constrained('time_slots')->onDelete('set null');
            $table->date('booking_date')->nullable();
            $table->time('booking_time')->nullable();
            $table->unsignedSmallInteger('traveler_count')->default(1);
            $table->string('status', 30)->default('pending'); // pending, confirmed, completed, cancelled, refunded
            $table->decimal('total_price', 12, 2)->default(0);
            $table->decimal('commission_amount', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->string('currency', 10)->default('USD');
            $table->string('payment_method', 30)->nullable(); // khqr, stripe
            $table->string('coupon_code')->nullable();
            $table->text('special_requests')->nullable();
            $table->timestamp('expires_at')->nullable(); // Redis lock TTL
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index('booking_ref');
            $table->index('user_id');
            $table->index('activity_id');
            $table->index('time_slot_id');
            $table->index('status');
            $table->index(['activity_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
