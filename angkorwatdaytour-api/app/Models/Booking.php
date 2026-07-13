<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    /** @use HasFactory<\Database\Factories\BookingFactory> */
    use HasFactory;

    protected $fillable = [
        'booking_ref',
        'user_id',
        'guest_email',
        'guest_name',
        'guest_phone',
        'activity_id',
        'time_slot_id',
        'booking_date',
        'booking_time',
        'traveler_count',
        'status',
        'total_price',
        'commission_amount',
        'discount_amount',
        'currency',
        'payment_method',
        'coupon_code',
        'special_requests',
        'expires_at',
        'confirmed_at',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'booking_date' => 'date',
            'booking_time' => 'datetime:H:i',
            'traveler_count' => 'integer',
            'total_price' => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'expires_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }

    public function timeSlot()
    {
        return $this->belongsTo(TimeSlot::class);
    }

    public function addons()
    {
        return $this->hasMany(BookingAddon::class);
    }

    public function statusHistories()
    {
        return $this->hasMany(BookingStatusHistory::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }

    public function ticket()
    {
        return $this->hasOne(Ticket::class);
    }

    public function refunds()
    {
        return $this->hasMany(Refund::class);
    }
}
