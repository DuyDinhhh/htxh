<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions; 
class Config extends Model
{
    use HasFactory,LogsActivity;
    protected $fillable = [
        'photo',

        'text_top',
        'text_top_color',
        'bg_top_color',

        'text_bottom',
        'text_bottom_color',
        'bg_bottom_color',

        'bg_middle_color',

        'table_header_color',
        'table_row_odd_color',
        'table_row_even_color',

        'table_text_color',
        'table_text_active_color',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
        ->useLogName('config')  
        ->logAll()
        ->logOnlyDirty()
        ->dontSubmitEmptyLogs()
        ->setDescriptionForEvent(fn($e) => ucfirst($e).' config: '.$this->name);
    }
}
 


  