<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username');
            $table->string('password');
            $table->string('status')->default("offline");
            $table->string('device_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
 
            $table->index('name', 'idx_name');
            $table->index('created_at', 'idx_staff_created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};