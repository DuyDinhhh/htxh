<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('device_configs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('device_id')
                  ->constrained('devices')
                  ->cascadeOnDelete();
            $table->json('config')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_configs');
    }
};
