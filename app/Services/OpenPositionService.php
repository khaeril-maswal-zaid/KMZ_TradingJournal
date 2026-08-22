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

            $totalBuyAmount = (float) $buyTransactions->sum(fn(Transaction $transaction) => (float) $transaction->amount);
            $totalBuyValue = (float) $buyTransactions->sum(fn(Transaction $transaction) => (float) $transaction->total);
            $totalSellAmount = (float) $sellTransactions->sum(fn(Transaction $transaction) => (float) $transaction->amount);
            $originalAmount = max($totalBuyAmount - $totalSellAmount, 0);
            $averageBuyPrice = $totalBuyAmount > 0 ? $totalBuyValue / $totalBuyAmount : 0;


            dd($totalBuyAmount);

            if ($sellTransactions->isEmpty() || $originalAmount <= 0) {
                $this->closePosition($analysisGroup, $asset);

                continue;
            }

            $position = OpenPosition::updateOrCreate(
                [
                    'source_analysis_group_id' => $analysisGroup->id,
                    'asset' => $asset,
                ],
                [
                    'buy_price' => $averageBuyPrice,
                    'amount' => $originalAmount,
                ],
            );

            $position->forceFill([
                'total' => $position->amount * $averageBuyPrice,
                'status' => OpenPosition::STATUS_OPEN,
            ])->save();

            // dd($position);
        }

        $analysisGroup->openPositions()
            ->whereNotIn('asset', $assets->all())
            ->update([
                'amount' => 0,
                'total' => 0,
                'status' => OpenPosition::STATUS_CLOSED,
            ]);
    }

    private function closePosition(AnalysisGroup $analysisGroup, string $asset): void
    {
        $analysisGroup->openPositions()
            ->where('asset', $asset)
            ->update([
                'status' => OpenPosition::STATUS_CLOSED,
            ]);
    }

    /**
     * @param  array<int, array{open_position_id: int, amount: numeric-string|float|int}>  $allocations
     */
    public function allocateToGroup(AnalysisGroup $analysisGroup, array $allocations): void
    {
        DB::transaction(function () use ($analysisGroup, $allocations): void {
            foreach ($allocations as $allocation) {

                $position = OpenPosition::query()
                    ->where('uuid', $allocation)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($position->source_analysis_group_id === $analysisGroup->id) {
                    throw ValidationException::withMessages([
                        'open_position_allocations' => 'Posisi terbuka dari grup yang sama tidak dapat digunakan ulang.',
                    ]);
                }

                if ($position->status !== OpenPosition::STATUS_OPEN || (float) $position->amount <= 0) {
                    throw ValidationException::withMessages([
                        'open_position_allocations' => 'Posisi terbuka sudah tidak tersedia.',
                    ]);
                }

                if ($analysisGroup->openPositionAllocations()->where('open_position_id', $position->id)->exists()) {
                    throw ValidationException::withMessages([
                        'open_position_allocations' => 'Posisi terbuka sudah digunakan oleh grup ini.',
                    ]);
                }


                AnalysisGroupOpenPosition::create([
                    'analysis_group_id' => $analysisGroup->id,
                    'open_position_id' => $position->id,
                ]);

                $position->forceFill([
                    'status' => OpenPosition::STATUS_CLOSED,
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
                    (float) $position->amount + (float) $allocation->amount,
                );

                $position->forceFill([
                    'amount' => $remainingAmount,
                    'total' => $remainingAmount * (float) $position->buy_price,
                    'status' => $remainingAmount > 0 ? OpenPosition::STATUS_OPEN : OpenPosition::STATUS_CLOSED,
                ])->save();

                $allocation->delete();
            }
        });
    }
}
