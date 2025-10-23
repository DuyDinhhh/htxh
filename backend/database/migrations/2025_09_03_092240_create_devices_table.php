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
        Schema::create('devices', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name', 255)->nullable();
            $table->string('serial', 100);//unique
            $table->string('mac', 20);//unique
            $table->foreignId('service_id')
                  ->nullable()
                  ->constrained('services')
                  ->nullOnDelete();
            $table->timestamp('created_at')->useCurrent()->nullable();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate()->nullable();            
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
        Schema::dropIfExists('devices');
    }
};
