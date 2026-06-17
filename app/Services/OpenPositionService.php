<?php

namespace App\Services;

use App\Models\AnalysisGroup;
use App\Models\AnalysisGroupOpenPosition;
use App\Models\OpenPosition;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
        $allocations = $analysisGroup->openPositionAllocations()
            ->with('openPosition')
            ->get();

        $assets = $transactions
            ->where('type', 'BUY')
            ->pluck('base_asset')
            ->merge($allocations->pluck('openPosition.asset'))
            ->filter()
            ->unique()
            ->values();

        foreach ($assets as $asset) {
            $assetTransactions = $transactions->where('base_asset', $asset);
            $buyTransactions = $assetTransactions->where('type', 'BUY');
            $sellTransactions = $assetTransactions->where('type', 'SELL');
            $assetAllocations = $allocations->filter(fn (AnalysisGroupOpenPosition $allocation) => $allocation->openPosition?->asset === $asset);

            $totalBuyAmount = (float) $buyTransactions->sum(fn (Transaction $transaction) => (float) $transaction->amount);
            $totalBuyValue = (float) $buyTransactions->sum(fn (Transaction $transaction) => (float) $transaction->total);
            $totalBuyAmount += (float) $assetAllocations->sum(fn (AnalysisGroupOpenPosition $allocation) => (float) $allocation->allocated_amount);
            $totalBuyValue += (float) $assetAllocations->sum(fn (AnalysisGroupOpenPosition $allocation) => (float) $allocation->allocated_total);
            $totalSellAmount = (float) $sellTransactions->sum(fn (Transaction $transaction) => (float) $transaction->amount);
            $originalAmount = max($totalBuyAmount - $totalSellAmount, 0);
            $averageBuyPrice = $totalBuyAmount > 0 ? $totalBuyValue / $totalBuyAmount : 0;

            $position = OpenPosition::updateOrCreate(
                [
                    'source_analysis_group_id' => $analysisGroup->id,
                    'asset' => $asset,
                ],
                [
                    'buy_price' => $averageBuyPrice,
                    'original_amount' => $originalAmount,
                ],
            );

            $usedAmount = (float) $position->usages()->sum('allocated_amount');
            $remainingAmount = max($originalAmount - $usedAmount, 0);

            $position->forceFill([
                'remaining_amount' => $remainingAmount,
                'total' => $remainingAmount * $averageBuyPrice,
                'status' => $remainingAmount > 0 ? OpenPosition::STATUS_OPEN : OpenPosition::STATUS_CLOSED,
            ])->save();
        }

        $analysisGroup->openPositions()
            ->whereNotIn('asset', $assets->all())
            ->update([
                'original_amount' => 0,
                'remaining_amount' => 0,
                'total' => 0,
                'status' => OpenPosition::STATUS_CLOSED,
            ]);
    }

    /**
     * @param  array<int, array{open_position_id: int, allocated_amount: numeric-string|float|int}>  $allocations
     */
    public function allocateToGroup(AnalysisGroup $analysisGroup, array $allocations): void
    {
        DB::transaction(function () use ($analysisGroup, $allocations): void {
            foreach ($allocations as $allocation) {
                $allocatedAmount = (float) $allocation['allocated_amount'];
                $position = OpenPosition::query()
                    ->whereKey($allocation['open_position_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($position->source_analysis_group_id === $analysisGroup->id) {
                    throw ValidationException::withMessages([
                        'open_position_allocations' => 'Posisi terbuka dari grup yang sama tidak dapat digunakan ulang.',
                    ]);
                }

                if ($position->status !== OpenPosition::STATUS_OPEN || (float) $position->remaining_amount <= 0) {
                    throw ValidationException::withMessages([
                        'open_position_allocations' => 'Posisi terbuka sudah tidak tersedia.',
                    ]);
                }

                if ($allocatedAmount - (float) $position->remaining_amount > 0.0000000001) {
                    throw ValidationException::withMessages([
                        'open_position_allocations' => 'Jumlah yang dipakai melebihi sisa posisi terbuka.',
                    ]);
                }

                if ($analysisGroup->openPositionAllocations()->where('open_position_id', $position->id)->exists()) {
                    throw ValidationException::withMessages([
                        'open_position_allocations' => 'Posisi terbuka sudah digunakan oleh grup ini.',
                    ]);
                }

                $allocatedTotal = $allocatedAmount * (float) $position->buy_price;
                $remainingAmount = max((float) $position->remaining_amount - $allocatedAmount, 0);

                AnalysisGroupOpenPosition::create([
                    'analysis_group_id' => $analysisGroup->id,
                    'open_position_id' => $position->id,
                    'allocated_amount' => $allocatedAmount,
                    'allocated_total' => $allocatedTotal,
                ]);

                $position->forceFill([
                    'remaining_amount' => $remainingAmount,
                    'total' => $remainingAmount * (float) $position->buy_price,
                    'status' => $remainingAmount > 0 ? OpenPosition::STATUS_OPEN : OpenPosition::STATUS_CLOSED,
                ])->save();
            }
        });
    }

    public function releaseAllocations(AnalysisGroup $analysisGroup): void
    {
        DB::transaction(function () use ($analysisGroup): void {
            $allocations = $analysisGroup->openPositionAllocations()
                ->with('openPosition')
                ->lockForUpdate()
                ->get();

            foreach ($allocations as $allocation) {
                $position = OpenPosition::query()
                    ->whereKey($allocation->open_position_id)
                    ->lockForUpdate()
                    ->first();

                if (! $position) {
                    continue;
                }

                $remainingAmount = min(
                    (float) $position->original_amount,
                    (float) $position->remaining_amount + (float) $allocation->allocated_amount,
                );

                $position->forceFill([
                    'remaining_amount' => $remainingAmount,
                    'total' => $remainingAmount * (float) $position->buy_price,
                    'status' => $remainingAmount > 0 ? OpenPosition::STATUS_OPEN : OpenPosition::STATUS_CLOSED,
                ])->save();

                $allocation->delete();
            }
        });
    }
}
