<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TimeSlot extends Model
{
    /** @use HasFactory<\Database\Factories\TimeSlotFactory> */
    use HasFactory;

    protected $fillable = [
        'activity_id',
        'date',
        'start_time',
        'end_time',
        'capacity',
        'booked_count',
        'price_override',
        'is_blackout',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'start_time' => 'datetime:H:i',
            'end_time' => 'datetime:H:i',
            'capacity' => 'integer',
            'booked_count' => 'integer',
            'price_override' => 'decimal:2',
            'is_blackout' => 'boolean',
        ];
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
