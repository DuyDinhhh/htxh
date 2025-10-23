<?php

namespace App\Models;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeviceConfig extends Model {
    use HasFactory,SoftDeletes;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $fillable = ['device_id', 'config', 'active', 'created_by', 'updated_by'];

    public function device() {
        return $this->belongsTo(Device::class);
    }
}
