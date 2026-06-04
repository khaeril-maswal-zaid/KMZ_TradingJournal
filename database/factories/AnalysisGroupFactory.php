<?php

namespace Database\Factories;

use App\Models\AnalysisGroup;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AnalysisGroup>
 */
class AnalysisGroupFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['BTC Scalping', 'ETH Swing Trade', 'SOL Breakout']).' '.fake()->monthName(),
            'description' => fake()->optional()->sentence(),
        ];
    }
}
