<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    /** @use HasFactory<\Database\Factories\SupportTicketFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subject',
        'body',
        'status',
        'ai_handled',
        'escalated_at',
        'assigned_to_id',
    ];

    protected function casts(): array
    {
        return [
            'ai_handled' => 'boolean',
            'escalated_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to_id');
    }
}
