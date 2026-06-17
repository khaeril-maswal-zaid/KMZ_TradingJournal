<?php

namespace App\Services;

use App\Models\AnalysisGroup;
use App\Models\AnalysisGroupOpenPosition;
use App\Models\Transaction;
use Illuminate\Support\Collection;

class AnalysisGroupCalculationService
{
    public function __construct(
        private readonly OpenPositionService $openPositionService,
    ) {}

    public function recalculate(AnalysisGroup $analysisGroup): AnalysisGroup
    {
        $transactions = $analysisGroup->transactions()->get(['transactions.id', 'type', 'total', 'executed_at']);
        $allocations = $analysisGroup->openPositionAllocations()->get(['allocated_amount', 'allocated_total']);
        $executedAt = $transactions->where('type', 'SELL')->max('executed_at');
        $totalBuy = (float) $transactions->where('type', 'BUY')->sum(fn(Transaction $transaction) => (float) $transaction->total);
        $totalBuy += (float) $allocations->sum(fn(AnalysisGroupOpenPosition $allocation) => (float) $allocation->allocated_total);
        $totalSell = (float) $transactions->where('type', 'SELL')->sum(fn(Transaction $transaction) => (float) $transaction->total);

        // also calculate amounts and average prices
        $totalBuyAmount = (float) $analysisGroup->transactions()->where('type', 'BUY')->sum('amount');
        $totalBuyAmount += (float) $allocations->sum(fn(AnalysisGroupOpenPosition $allocation) => (float) $allocation->allocated_amount);
        $totalSellAmount = (float) $analysisGroup->transactions()->where('type', 'SELL')->sum('amount');

        $averageBuyPrice = $totalBuyAmount > 0 ? $totalBuy / $totalBuyAmount : 0;
        $averageSellPrice = $totalSellAmount > 0 ? $totalSell / $totalSellAmount : 0;
        $profit = $totalSell - $totalBuy;
        $roiPercent = $totalBuy > 0 ? ($profit / $totalBuy) * 100 : 0;

        $analysisGroup->forceFill([
            'executed_at' => $executedAt ?? now(),
            'total_buy' => $totalBuy,
            'total_buy_amount' => $totalBuyAmount,
            'average_buy_price' => $averageBuyPrice,
            'total_sell' => $totalSell,
            'total_sell_amount' => $totalSellAmount,
            'average_sell_price' => $averageSellPrice,
            'profit' => $profit,
            'roi_percent' => $roiPercent,
            'status' => $this->statusFor($profit),
        ])->save();

        $this->openPositionService->recalculate($analysisGroup);

        return $analysisGroup->refresh();
    }

    /**
     * @param  Collection<int, Transaction>  $buyTransactions
     * @return array<string, float>
     */
    public function sellPlannerSummary(Collection $buyTransactions, ?Collection $openPositionAllocations = null): array
    {
        $totalAmount = (float) $buyTransactions->sum(fn(Transaction $transaction) => (float) $transaction->amount);
        $totalCost = (float) $buyTransactions->sum(fn(Transaction $transaction) => (float) $transaction->total);
        $openPositionAllocations ??= collect();
        $totalAmount += (float) $openPositionAllocations->sum(fn(AnalysisGroupOpenPosition $allocation) => (float) $allocation->allocated_amount);
        $totalCost += (float) $openPositionAllocations->sum(fn(AnalysisGroupOpenPosition $allocation) => (float) $allocation->allocated_total);

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
