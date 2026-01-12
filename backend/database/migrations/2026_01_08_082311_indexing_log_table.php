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
        Schema::table('activity_log', function (Blueprint $table) {
            $table->index(['log_name', 'created_at'], 'idx_log_name_created_at');
            $table->index('event', 'idx_event');
            $table->index(['causer_type', 'causer_id'], 'idx_causer');
            $table->index(['subject_type', 'subject_id'], 'idx_subject');
            $table->index('created_at', 'idx_created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activity_log', function (Blueprint $table) {
            if (config('database.default') === 'mysql') {
                $table->dropFullText('idx_fulltext_search');
            }
            
            $table->dropIndex('idx_created_at');
            $table->dropIndex('idx_subject');
            $table->dropIndex('idx_causer');
            $table->dropIndex('idx_event');
            $table->dropIndex('idx_log_name_created_at');
            
        });
    }
};
