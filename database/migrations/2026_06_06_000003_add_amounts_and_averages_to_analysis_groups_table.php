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
        Schema::table('analysis_groups', function (Blueprint $table) {
            $table->decimal('total_buy_amount', 24, 10)->default(0)->after('total_buy');
            $table->decimal('total_sell_amount', 24, 10)->default(0)->after('total_sell');
            $table->decimal('average_buy_price', 24, 10)->default(0)->after('total_buy_amount');
            $table->decimal('average_sell_price', 24, 10)->default(0)->after('total_sell_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('analysis_groups', function (Blueprint $table) {
            $table->dropColumn([
                'total_buy_amount',
                'total_sell_amount',
                'average_buy_price',
                'average_sell_price',
            ]);
        });
    }
};
