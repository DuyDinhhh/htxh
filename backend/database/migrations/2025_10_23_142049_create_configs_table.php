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
            Schema::create('configs', function (Blueprint $table) {
            $table->id();
            $table->string('photo')->nullale();
            $table->string('text_top')->nullable();
            $table->string('text_top_color')->nullable();
            $table->string('bg_top_color')->nullable();

            $table->string('text_bottom')->nullable();
            $table->string('text_bottom_color')->nullable();
            $table->string('bg_bottom_color')->nullable();

            $table->string('bg_middle_color')->nullable();

            $table->string('table_header_color')->nullable();
            $table->string('table_row_odd_color')->nullable();
            $table->string('table_row_even_color')->nullable();

            $table->string('table_text_color')->nullable();
            $table->string('table_text_active_color')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configs');
    }
};
