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
            $table->id();
            $table->string('ticket_number');
            $table->integer('sequence');
            $table->string('device_id')->nullable();
            $table->bigInteger('service_id')->nullable();
            $table->bigInteger('customer_id')->nullable();;
            $table->enum('status', [
                'waiting',
                'called',
                'skipped',
                'processing',     
            ])->default('waiting');
            $table->timestamps();
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
