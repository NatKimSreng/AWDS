<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    /** @use HasFactory<\Database\Factories\ActivityFactory> */
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'category_id',
        'city_id',
        'title',
        'slug',
        'description',
        'itinerary_json',
        'inclusions',
        'exclusions',
        'meeting_point_address',
        'meeting_point_lat',
        'meeting_point_lng',
        'duration_minutes',
        'min_group',
        'max_group',
        'base_price_usd',
        'status',
        'is_featured',
        'is_instant_book',
        'is_refundable',
        'free_cancellation_hours',
        'spoken_languages',
        'published_at',
        'what_to_bring',
        'not_allowed',
        'know_before_you_go',
        'additional_info',
        'not_suitable_for',
        'weather_policy',
        'start_time_flexibility',
    ];

    protected function casts(): array
    {
        return [
            'itinerary_json' => 'array',
            'spoken_languages' => 'array',
            'meeting_point_lat' => 'decimal:8',
            'meeting_point_lng' => 'decimal:8',
            'base_price_usd' => 'decimal:2',
            'duration_minutes' => 'integer',
            'min_group' => 'integer',
            'max_group' => 'integer',
            'is_featured' => 'boolean',
            'is_instant_book' => 'boolean',
            'is_refundable' => 'boolean',
            'free_cancellation_hours' => 'integer',
            'published_at' => 'datetime',
        ];
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function category()
    {
        return $this->belongsTo(ActivityCategory::class);
    }

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function images()
    {
        return $this->hasMany(ActivityImage::class);
    }

    public function heroImage()
    {
        return $this->hasOne(ActivityImage::class)->where('is_hero', true);
    }

    public function timeSlots()
    {
        return $this->hasMany(TimeSlot::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function serviceTypes()
    {
        return $this->belongsToMany(ServiceType::class, 'activity_service_type');
    }

    public function transportModes()
    {
        return $this->belongsToMany(TransportMode::class, 'activity_transport_mode');
    }

    public function scopeLive($query)
    {
        return $query->where('status', 'live')->whereNotNull('published_at');
    }
}
