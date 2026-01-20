<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {

            // Primary Key (automatically indexed)
            $table->bigIncrements('id');
            $table->string('adapter_type', 20)->nullable();
            $table->string('full_name', 255)->nullable();

            // Unique indexes
            $table->string('cccd', 20)->nullable();
            $table->string('cmnd', 20)->nullable();

            // Other fields
            $table->date('date_of_birth')->nullable();
            $table->string('sex', 10)->nullable();
            $table->text('address')->nullable();
            $table->date('date_of_issue')->nullable();

            // Timestamps & soft deletes
            $table->timestamps();
            $table->softDeletes();
            
            // Single-column indexes
            $table->index('adapter_type', 'idx_customers_adapter_type');
            $table->index('full_name', 'idx_customers_full_name');
            $table->index('date_of_birth', 'idx_customers_dob');

            // Composite index (common search use case)
            $table->index(
                ['full_name', 'date_of_birth'],
                'idx_customers_name_dob'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
