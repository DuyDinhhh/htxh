<?php

namespace App\Models;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model {
    use HasFactory,SoftDeletes;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $fillable = ['device_id', 'service_id', 'user_id', 'value', 'created_by', 'updated_by'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function ticket() {
        return $this->belongsTo(Ticket::class);
    }

    public function device() {
        return $this->belongsTo(Device::class);
    }

    public function service() {
        return $this->belongsTo(Service::class);
    }
}
