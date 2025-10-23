<?php

namespace App\Models;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model {
    use HasFactory,SoftDeletes;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $fillable = ['name', 'location', 'created_by', 'updated_by'];

    // public function devices() {
    //     return $this->hasMany(Device::class);
    // }
    
    // public function device() {
    //     return $this->hasOne(Device::class);
    // }

    public function devices()
    {
        return $this->belongsToMany(Device::class, 'device_service', 'service_id', 'device_id')
        ->withPivot('priority_number')
        ->withTimestamps(); // if your pivot has timestamps
    }

    public function feedback() {
        return $this->hasMany(Feedback::class);
    }
}
