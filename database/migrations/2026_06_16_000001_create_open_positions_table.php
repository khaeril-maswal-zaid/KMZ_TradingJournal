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
        Schema::create('open_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('source_analysis_group_id')->constrained('analysis_groups')->cascadeOnDelete();
            $table->string('asset');
            $table->decimal('buy_price', 24, 10)->default(0);
            $table->decimal('original_amount', 24, 10)->default(0);
            $table->decimal('remaining_amount', 24, 10)->default(0);
            $table->decimal('total', 24, 10)->default(0);
            $table->enum('status', ['OPEN', 'CLOSED'])->default('OPEN');
            $table->timestamps();

            $table->unique(['source_analysis_group_id', 'asset']);
            $table->index(['status', 'asset']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('open_positions');
    }
};
