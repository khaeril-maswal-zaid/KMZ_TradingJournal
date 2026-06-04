<?php

namespace Database\Factories;

use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    public function definition(): array
    {
        $baseAsset = fake()->randomElement(['BTC', 'ETH', 'SOL', 'BNB', 'XRP']);
        $quoteAsset = 'USDT';
        $type = fake()->randomElement(['BUY', 'SELL']);
        $amount = fake()->randomFloat(6, 0.01, 2.5);
        $price = fake()->randomFloat(4, 80, 68000);

        return [
            'pair' => $baseAsset.$quoteAsset,
            'base_asset' => $baseAsset,
            'quote_asset' => $quoteAsset,
            'type' => $type,
            'price' => $price,
            'amount' => $amount,
            'total' => $price * $amount,
            'fee_amount' => fake()->randomFloat(6, 0, 1.2),
            'fee_coin' => fake()->randomElement([$baseAsset, $quoteAsset, 'BNB']),
            'executed_at' => fake()->dateTimeBetween('-6 months', 'now'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
