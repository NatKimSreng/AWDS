<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    /** @use HasFactory<\Database\Factories\CityFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'hero_image_url',
        'lat',
        'lng',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'decimal:8',
            'lng' => 'decimal:8',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }
}
