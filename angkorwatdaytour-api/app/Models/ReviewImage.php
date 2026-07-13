<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewImage extends Model
{
    /** @use HasFactory<\Database\Factories\ReviewImageFactory> */
    use HasFactory;

    protected $fillable = [
        'review_id',
        'url',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function review()
    {
        return $this->belongsTo(Review::class);
    }
}
