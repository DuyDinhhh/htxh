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
        Schema::create('device_service', function (Blueprint $table) {
            $table->id();
            // Foreign key to devices table
            $table->text('device_id');
            // $table->foreign('device_id')->references('id')->on('devices')->onDelete('cascade');
            // Foreign key to services table
            $table->unsignedBigInteger('service_id');
            $table->Integer('priority_number');
            // $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
            // Optional: additional fields
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_service');
    }
};
