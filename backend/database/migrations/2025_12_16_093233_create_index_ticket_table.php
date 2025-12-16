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
        Schema::create('tickets', function (Blueprint $table) {
            $table->primary('id');
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
       Schema::dropIfExists('tickets');
    }
};
