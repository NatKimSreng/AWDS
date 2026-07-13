<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = ['name', 'label', 'description'];

    public const CUSTOMER = 'customer';
    public const PROVIDER = 'provider';
    public const ADMIN = 'admin';
}
