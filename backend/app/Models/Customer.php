<?php

namespace App\Models;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
 use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions; 

class Customer extends Model
{
    use HasFactory,SoftDeletes;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $fillable = [
        'adapter_type',
        'cccd',
        'cmnd',
        'full_name',
        'date_of_birth',
        'sex',
        'address',
        'date_of_issue',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'date_of_issue' => 'date',
        'created_at'    => 'datetime',
        'updated_at'    => 'datetime',
    ];

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'customer_id', 'id');
    }
    
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
        ->useLogName('customer')  
        ->logAll()
        ->logOnlyDirty()
        ->dontSubmitEmptyLogs()
        ->setDescriptionForEvent(fn($e) => ucfirst($e).' customer: '.$this->name);
    }
}
