<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityImage extends Model
{
    /** @use HasFactory<\Database\Factories\ActivityImageFactory> */
    use HasFactory;

    protected $fillable = [
        'activity_id',
        'url',
        'alt_text',
        'sort_order',
        'is_hero',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_hero' => 'boolean',
        ];
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }
}
