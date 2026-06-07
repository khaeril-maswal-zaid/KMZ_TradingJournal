<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class PortfolioSummaryService
{
    /**
     * Get portfolio assets summary for a user
     * Returns open positions with remaining quantities and cost basis
     *
     * @return array<int, array<string, mixed>>
     */
    public function getAssetsSummary(User $user): array
    {
        $transactions = Transaction::where('user_id', $user->id)
            ->orderBy('executed_at', 'ASC')
            ->get(['id', 'base_asset', 'pair', 'quote_asset', 'type', 'price', 'amount', 'total', 'executed_at']);

        // Group by base_asset to process each asset separately
        $grouped = $transactions->groupBy('base_asset');

        $portfolio = [];

        foreach ($grouped as $baseAsset => $assetTransactions) {
            $assetData = $this->calculateAssetPosition($baseAsset, $assetTransactions);

            if ($assetData) {
                $portfolio[] = $assetData;
            }
        }

        // Sort by last_updated descending to show most recent first
        usort($portfolio, function ($a, $b) {
            return $b['last_updated']->getTimestamp() - $a['last_updated']->getTimestamp();
        });

        return $portfolio;
    }

    /**
     * Calculate position for a single asset
     * Uses FIFO ledger logic for accurate cost basis tracking
     *
     * @param string $baseAsset
     * @param Collection $transactions
     * @return array<string, mixed>|null
     */
    private function calculateAssetPosition(string $baseAsset, Collection $transactions): ?array
    {
        $pair = $transactions->first()?->pair;
        $quoteAsset = $transactions->first()?->quote_asset;

        // Track cumulative values
        $totalBuyAmount = 0.0;
        $totalBuyCost = 0.0;
        $totalSellAmount = 0.0;
        $totalSellCost = 0.0;
        $lastUpdated = null;
        $averageBuyPrice = 0.0;

        // Process transactions sequentially (FIFO ledger)
        foreach ($transactions as $transaction) {
            $lastUpdated = $transaction->executed_at;
            $amount = (float) $transaction->amount;
            $total = (float) $transaction->total;
            $price = (float) $transaction->price;

            if ($transaction->type === 'BUY') {
                $totalBuyAmount += $amount;
                $totalBuyCost += $total;
            } elseif ($transaction->type === 'SELL') {
                $totalSellAmount += $amount;
                $totalSellCost += $total;
            }
        }

        // Calculate remaining position
        $remainingAmount = $totalBuyAmount - $totalSellAmount;

        // If position is closed, skip it
        if ($remainingAmount <= 0) {
            return null;
        }

        // Calculate cost basis based on FIFO
        // Remaining Cost Basis = (Remaining Amount / Total Buy Amount) × Total Buy Cost
        $costBasis = ($remainingAmount / $totalBuyAmount) * $totalBuyCost;

        // Average buy price for remaining position
        $averageBuyPrice = $remainingAmount > 0 ? $costBasis / $remainingAmount : 0.0;

        return [
            'asset' => $baseAsset,
            'pair' => $pair,
            'remaining_amount' => round($remainingAmount, 10),
            'average_buy_price' => round($averageBuyPrice, 10),
            'cost_basis' => round($costBasis, 2),
            'estimated_value' => null, // Placeholder for future market price integration
            'unrealized_pnl' => null, // Placeholder for future market price integration
            'last_updated' => $lastUpdated,
        ];
    }
}
