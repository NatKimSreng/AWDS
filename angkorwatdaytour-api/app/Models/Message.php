<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    /** @use HasFactory<\Database\Factories\MessageFactory> */
    use HasFactory;

    protected $fillable = [
        'thread_id',
        'sender_id',
        'sender_type',
        'recipient_id',
        'recipient_type',
        'body',
        'read_at',
        'attachments',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
            'attachments' => 'array',
        ];
    }

    public function thread()
    {
        return $this->belongsTo(MessageThread::class, 'thread_id');
    }

    public function sender()
    {
        return $this->morphTo();
    }

    public function recipient()
    {
        return $this->morphTo();
    }
}
