<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingStatusHistory extends Model
{
    /** @use HasFactory<\Database\Factories\BookingStatusHistoryFactory> */
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'status',
        'changed_by_type',
        'changed_by_id',
        'note',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function changedBy()
    {
        return $this->morphTo();
    }
}
