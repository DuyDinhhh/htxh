<?php

// app/Models/Ticket.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use HasFactory;
    protected $casts = ['created_at' => 'datetime', 'updated_at' => 'datetime'];    
    protected $fillable = ['ticket_number', 'device_id','service_id'];

    
    public function device()
    {
        return $this->belongsTo(Device::class);
    }

     
    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
