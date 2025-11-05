<?php

namespace App\Models;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions; 
class Device extends Model {

    use HasFactory,SoftDeletes,LogsActivity;
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false; 
    protected $fillable = ['id','name', 'status','created_at','updated_at', 'created_by', 'updated_by'];

 
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

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
        ->useLogName('device')  
        ->logAll()
        ->logOnlyDirty()
        ->dontSubmitEmptyLogs()
        ->setDescriptionForEvent(fn($e) => ucfirst($e).' device: '.$this->name);
    }
}