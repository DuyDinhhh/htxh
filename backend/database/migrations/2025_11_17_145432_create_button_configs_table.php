<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('button_configs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('service_id')->nullable()->unique();

            // Button dimensions
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();

            // Alignment values
            $table->string('h_align', 20)->nullable();   // left / center / right / custom
            $table->string('v_align', 20)->nullable();   // top / center / bottom

            // Absolute position on canvas
            $table->integer('x')->nullable();
            $table->integer('y')->nullable();

            // Global only - but stored in same row (service_id = null)
            $table->boolean('use_fixed_on_mobile')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('button_configs');
    }
};
