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
        Schema::create('analysis_groups', function (Blueprint $table) {
            $table->id();
            $table->dateTime('executed_at')->nullable();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('total_buy', 24, 10)->default(0);
            $table->decimal('total_sell', 24, 10)->default(0);
            $table->decimal('profit', 24, 10)->default(0);
            $table->decimal('roi_percent', 12, 4)->default(0);
            $table->enum('status', ['PROFIT', 'LOSS', 'BREAK_EVEN'])->default('BREAK_EVEN');
            $table->timestamps();

            $table->index(['status', 'executed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analysis_groups');
    }
};
