<?php

namespace App\Services;

use App\Models\AnalysisGroup;
use App\Models\Transaction;
use Illuminate\Support\Collection;

class AnalysisGroupCalculationService
{
    public function recalculate(AnalysisGroup $analysisGroup): AnalysisGroup
    {
        $transactions = $analysisGroup->transactions()->get(['transactions.id', 'type', 'total', 'executed_at']);
        $executedAt = $transactions->where('type', 'SELL')->max('executed_at');

        $totalBuy = (float) $transactions->where('type', 'BUY')->sum(fn(Transaction $transaction) => (float) $transaction->total);
        $totalSell = (float) $transactions->where('type', 'SELL')->sum(fn(Transaction $transaction) => (float) $transaction->total);
        $profit = $totalSell - $totalBuy;
        $roiPercent = $totalBuy > 0 ? ($profit / $totalBuy) * 100 : 0;

        $analysisGroup->forceFill([
            'executed_at' => $executedAt,
            'total_buy' => $totalBuy,
            'total_sell' => $totalSell,
            'profit' => $profit,
            'roi_percent' => $roiPercent,
            'status' => $this->statusFor($profit),
        ])->save();

        return $analysisGroup->refresh();
    }

    /**
     * @param  Collection<int, Transaction>  $buyTransactions
     * @return array<string, float>
     */
    public function sellPlannerSummary(Collection $buyTransactions): array
    {
        $totalAmount = (float) $buyTransactions->sum(fn(Transaction $transaction) => (float) $transaction->amount);
        $totalCost = (float) $buyTransactions->sum(fn(Transaction $transaction) => (float) $transaction->total);

        $average = $totalAmount > 0 ? $totalCost / $totalAmount : 0.0;

        return [
            'total_buy_amount' => $totalAmount,
            'total_buy_cost' => $totalCost,
            'average_buy_price' => $average,
        ];
    }

    /**
     * @param  Collection<int, Transaction>  $sellTransactions
     * @return array<int, array<string, mixed>>
     */
    public function sellBreakdown(float $totalBuy, Collection $sellTransactions): array
    {
        return $sellTransactions
            ->values()
            ->map(function (Transaction $transaction, int $index) use ($totalBuy): array {
                $subtotalSell = (float) $transaction->total;
                $profit = $subtotalSell - $totalBuy;

                return [
                    'id' => $transaction->id,
                    'label' => 'Hasil Penjualan ' . ($index + 1),
                    'transaction' => $transaction,
                    'subtotal_buy' => $totalBuy,
                    'subtotal_sell' => $subtotalSell,
                    'profit' => $profit,
                    'roi_percent' => $totalBuy > 0 ? ($profit / $totalBuy) * 100 : 0,
                    'status' => $this->statusFor($profit),
                ];
            })
            ->all();
    }

    private function statusFor(float $profit): string
    {
        if ($profit > 0) {
            return 'PROFIT';
        }

        if ($profit < 0) {
            return 'LOSS';
        }

        return 'BREAK_EVEN';
    }
}
