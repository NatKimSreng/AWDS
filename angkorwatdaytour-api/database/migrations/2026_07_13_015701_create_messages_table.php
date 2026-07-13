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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thread_id')->constrained('message_threads')->onDelete('cascade');
            $table->unsignedBigInteger('sender_id');
            $table->string('sender_type', 50); // user, provider
            $table->unsignedBigInteger('recipient_id');
            $table->string('recipient_type', 50);
            $table->text('body');
            $table->timestamp('read_at')->nullable();
            $table->json('attachments')->nullable();
            $table->timestamps();

            $table->index('thread_id');
            $table->index(['sender_id', 'sender_type']);
            $table->index(['recipient_id', 'recipient_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
