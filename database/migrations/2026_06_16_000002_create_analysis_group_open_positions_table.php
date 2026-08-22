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
        Schema::create('analysis_group_open_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('analysis_group_id')->constrained()->cascadeOnDelete();
            $table->foreignId('open_position_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['analysis_group_id', 'open_position_id'], 'analysis_group_open_position_unique');
            $table->index('open_position_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analysis_group_open_positions');
    }
};
