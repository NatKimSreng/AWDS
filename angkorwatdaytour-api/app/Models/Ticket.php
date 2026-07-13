<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    /** @use HasFactory<\Database\Factories\TicketFactory> */
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'ticket_ref',
        'qr_payload',
        'status',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'qr_payload' => 'array',
            'used_at' => 'datetime',
        ];
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
