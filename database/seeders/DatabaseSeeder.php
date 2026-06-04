<?php

namespace Database\Seeders;

use App\Models\AnalysisGroup;
use App\Models\Transaction;
use App\Models\User;
use App\Services\AnalysisGroupCalculationService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Trader Demo',
            'email' => 'demo@example.com',
        ]);

        // $transactions = Transaction::factory(36)->create();
        // $calculator = app(AnalysisGroupCalculationService::class);

        // collect([
        //     ['name' => 'BTC Scalping Juni', 'description' => 'Analisa scalping BTC dengan beberapa entry dan exit.'],
        //     ['name' => 'ETH Swing Trade', 'description' => 'Tracking modal dan hasil jual ETH.'],
        //     ['name' => 'SOL Breakout', 'description' => 'Eksperimen breakout SOL setelah konfirmasi volume.'],
        // ])->each(function (array $payload, int $index) use ($transactions, $calculator): void {
        //     $group = AnalysisGroup::create($payload);
        //     $group->transactions()->attach($transactions->slice($index * 8, 8)->pluck('id')->all());
        //     $calculator->recalculate($group);
        // });
    }
}
