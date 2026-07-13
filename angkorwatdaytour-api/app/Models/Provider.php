<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Provider extends Model
{
    /** @use HasFactory<\Database\Factories\ProviderFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_name',
        'bio',
        'service_area',
        'verification_status',
        'id_document_url',
        'license_document_url',
        'avg_rating',
        'total_bookings',
        'commission_rate',
        'is_featured',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'avg_rating' => 'decimal:1',
            'commission_rate' => 'decimal:2',
            'is_featured' => 'boolean',
            'approved_at' => 'datetime',
        ];
    }

    public function scopeApproved($query)
    {
        return $query->where('verification_status', 'approved')
            ->whereNotNull('approved_at');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    public function payoutAccounts()
    {
        return $this->hasMany(ProviderPayoutAccount::class);
    }

    public function payouts()
    {
        return $this->hasMany(Payout::class);
    }

    public function messageThreads()
    {
        return $this->hasMany(MessageThread::class);
    }
}
