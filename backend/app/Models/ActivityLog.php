<?php

namespace App\Models;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model {

    use HasFactory,SoftDeletes;
    protected $primaryKey = 'id';
    public $incrementing = true;
    
    protected $fillable = ['actor_type', 'actor_id', 'action', 'context'];

    public static function logChanges(array $oldValues, array $newValues)
    {
        $changes = [];

        foreach ($oldValues as $key => $oldValue) {
            if ($key === 'updated_at' || $key === 'updated_by') {
                continue;
            }

            $newValue = $newValues[$key] ?? null;

            // Convert enums to their scalar value for comparison
            if ($oldValue instanceof \BackedEnum) {
                $oldValue = $oldValue->value;
            }
            if ($newValue instanceof \BackedEnum) {
                $newValue = $newValue->value;
            }

            if ((string)$oldValue !== (string)$newValue) {
                $changes[$key] = [
                    'old' => $oldValue,
                    'new' => $newValue,
                ];
            }
        }

        return $changes;
    }
    /**
     * Polymorphic relationship to the related model (e.g., Category, Product)
     */
    public function loggable()
    {
        return $this->morphTo();
    }
    
    public function user() {
        return $this->belongsTo(User::class, 'actor_id');
    }
}