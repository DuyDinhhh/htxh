<?php

namespace App\Models;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions; 
 class Service extends Model {
    
    use HasFactory,SoftDeletes,LogsActivity;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $fillable = ['name', 'queue_number', 'color' ,'created_by', 'updated_by'];

    public function devices()
    {
        return $this->belongsToMany(Device::class, 'device_service', 'service_id', 'device_id')
        ->withPivot('priority_number')
        ->withTimestamps();  
    }

    public function feedback() {
        return $this->hasMany(Feedback::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
        ->useLogName('service')  
        ->logAll()
        ->logOnlyDirty()
        ->dontSubmitEmptyLogs()
        ->setDescriptionForEvent(fn($e) => ucfirst($e).' service: '.$this->name);
    }

}
