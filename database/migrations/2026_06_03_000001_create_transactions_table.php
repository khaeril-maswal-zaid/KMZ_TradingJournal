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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('pair');
            $table->string('base_asset');
            $table->string('quote_asset');
            $table->enum('type', ['BUY', 'SELL']);
            $table->decimal('price', 24, 10);
            $table->decimal('amount', 24, 10);
            $table->decimal('total', 24, 10);
            $table->decimal('fee_amount', 24, 10)->default(0);
            $table->string('fee_coin')->nullable();
            $table->dateTime('executed_at');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['type', 'executed_at']);
            $table->index('pair');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
