<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class ButtonConfig extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'button_configs';

    protected $fillable = [
        'service_id',

        'width',
        'height',
        'h_align',
        'v_align',

        'x',
        'y',

        'use_fixed_on_mobile',
    ];

    protected $casts = [
        'use_fixed_on_mobile' => 'boolean',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('button_config')
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(function ($eventName) {
                return ucfirst($eventName).' button_config: service_id=' . ($this->service_id ?? 'GLOBAL');
            });
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
