<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            // Add indexes to the existing 'tickets' table
            $table->index('device_id', 'idx_device_id');
            $table->index('service_id', 'idx_service_id');
            $table->index('created_at', 'idx_created_at');
            $table->index(['device_id', 'service_id'], 'idx_device_service');
            $table->index(['service_id', 'created_at'], 'tickets_service_id_created_at_sequence_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            // Drop the indexes in the 'tickets' table
            $table->dropIndex('idx_device_id');
            $table->dropIndex('idx_service_id');
            $table->dropIndex('idx_created_at');
            $table->dropIndex('idx_device_service');
            $table->dropIndex('tickets_service_id_created_at_sequence_index');
        });
    }
};
