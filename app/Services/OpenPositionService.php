<?php

namespace App\Services;

use App\Models\AnalysisGroup;
use App\Models\OpenPosition;
use App\Models\Transaction;

class OpenPositionService
{
    public function recalculate(AnalysisGroup $analysisGroup): void
    {
        $transactions = $analysisGroup->transactions()->get([
            'transactions.id',
            'base_asset',
            'type',
            'amount',
            'total',
        ]);

        $assets = $transactions
            ->where('type', 'BUY')
            ->pluck('base_asset')
            ->filter()
            ->unique()
            ->values();

        foreach ($assets as $asset) {
            $assetTransactions = $transactions->where('base_asset', $asset);
            $buyTransactions = $assetTransactions->where('type', 'BUY');
            $sellTransactions = $assetTransactions->where('type', 'SELL');

            $totalBuyAmount = (float) $buyTransactions->sum(fn (Transaction $transaction) => (float) $transaction->amount);
            $totalBuyValue = (float) $buyTransactions->sum(fn (Transaction $transaction) => (float) $transaction->total);
            $totalSellAmount = (float) $sellTransactions->sum(fn (Transaction $transaction) => (float) $transaction->amount);
            $remainingAmount = max($totalBuyAmount - $totalSellAmount, 0);
            $averageBuyPrice = $totalBuyAmount > 0 ? $totalBuyValue / $totalBuyAmount : 0;
            $status = $remainingAmount > 0 ? OpenPosition::STATUS_OPEN : OpenPosition::STATUS_CLOSED;

            OpenPosition::updateOrCreate(
                [
                    'source_analysis_group_id' => $analysisGroup->id,
                    'asset' => $asset,
                ],
                [
                    'buy_price' => $averageBuyPrice,
                    'amount' => $remainingAmount,
                    'total' => $remainingAmount * $averageBuyPrice,
                    'status' => $status,
                ],
            );
        }

        $analysisGroup->openPositions()
            ->whereNotIn('asset', $assets->all())
            ->update([
                'amount' => 0,
                'total' => 0,
                'status' => OpenPosition::STATUS_CLOSED,
            ]);
    }
}
