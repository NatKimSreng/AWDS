<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityCategory extends Model
{
    /** @use HasFactory<\Database\Factories\ActivityCategoryFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'parent_id',
        'icon',
        'description',
        'hero_image_url',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function parent()
    {
        return $this->belongsTo(ActivityCategory::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(ActivityCategory::class, 'parent_id');
    }

    public function activities()
    {
        return $this->hasMany(Activity::class, 'category_id');
    }
}
