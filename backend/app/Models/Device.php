<?php

namespace App\Models;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Device extends Model {
    use HasFactory,SoftDeletes;
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    protected $fillable = ['id','name', 'serial', 'mac','status', 'service_id', 'created_by', 'updated_by'];

    // public function service() {
    //     return $this->belongsTo(Service::class);
    // }
    public function services()
    {
        return $this->belongsToMany(Service::class, 'device_service', 'device_id', 'service_id')
                    ->withPivot('priority_number')
                    ->withTimestamps(); 
    }

    public function configs() {
        return $this->hasMany(DeviceConfig::class);
    }

    public function feedback() {
        return $this->hasMany(Feedback::class);
    }

    public function oldestTicket()
    {
        return $this->hasOne(Ticket::class)->oldestOfMany('created_at');
    }
}