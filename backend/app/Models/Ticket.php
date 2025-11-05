<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions; 

class Ticket extends Model
{
    use HasFactory,LogsActivity;
    protected $casts = ['created_at' => 'datetime', 'updated_at' => 'datetime'];    
    protected $fillable = ['ticket_number', 'device_id','service_id','status'];
 
    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function deviceWithTrashed()
    {
        return $this->belongsTo(Device::class, 'device_id', 'id')->withTrashed();
    }

    public function serviceWithTrashed()
    {
        return $this->belongsTo(Service::class,'service_id','id')->withTrashed();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
        ->useLogName('ticket')  
        ->logAll()
        ->logOnlyDirty()
        ->dontSubmitEmptyLogs()
        ->setDescriptionForEvent(fn($e) => ucfirst($e).' ticket: '.$this->ticket_number);
    }
}
