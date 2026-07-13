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
        Schema::create('provider_payout_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_id')->constrained('providers')->onDelete('cascade');
            $table->string('method', 50); // bank, wing, aba
            $table->string('account_name')->nullable();
            $table->string('account_number')->nullable();
            $table->text('account_details_encrypted')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index('provider_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('provider_payout_accounts');
    }
};
