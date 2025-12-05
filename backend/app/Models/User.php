<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'password',
        'created_at', 'updated_at'
    ];

 
    protected $hidden = [
        'password',
     ];

 
    protected function casts(): array
    {
        return [
             'password' => 'hashed',
        ];
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

 
    public function getJWTCustomClaims()
    {
        return [];
    }

    public function feedback() {
        return $this->hasMany(Feedback::class);
    }

    public function activityLogs() {
        return $this->hasMany(ActivityLog::class, 'actor_id');
    }

}
