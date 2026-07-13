<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProviderPayoutAccount extends Model
{
    /** @use HasFactory<\Database\Factories\ProviderPayoutAccountFactory> */
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'method',
        'account_name',
        'account_number',
        'account_details_encrypted',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }
}
