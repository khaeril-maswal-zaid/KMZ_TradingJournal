<?php

namespace App\Services;

use App\Models\AnalysisGroup;
use Illuminate\Support\Facades\Auth;
use App\Models\OpenPosition;
use App\Models\Transaction;
use Illuminate\Support\Collection;

class AnalysisGroupSelectableItemService
{
    /**
     * @return Collection<int, Transaction|OpenPosition>
     */
    public function forNewGroup(bool $includeOpenPositions = false): Collection
    {
        $userId =  Auth::id();
        $transactions = Transaction::query()
            ->where('user_id', $userId)
            ->doesntHave('analysisGroupAssignment')
            ->latest('executed_at')
            ->get();

        return $includeOpenPositions
            ? $this->mergeWithOpenPositions($transactions, $userId)
            : $transactions;
    }

    /**
     * @return Collection<int, Transaction|OpenPosition>
     */
    public function forExistingGroup(AnalysisGroup $analysisGroup, bool $includeOpenPositions = false): Collection
    {
        $transactions = Transaction::query()
            ->where('user_id', $analysisGroup->user_id)
            ->with('analysisGroupAssignment.analysisGroup')
            ->latest('executed_at')
            ->get();

        return $includeOpenPositions
            ? $this->mergeWithOpenPositions($transactions, $analysisGroup->user_id, $analysisGroup)
            : $transactions;
    }

    /**
     * @param  Collection<int, Transaction>  $transactions
     * @return Collection<int, Transaction|OpenPosition>
     */
    private function mergeWithOpenPositions(Collection $transactions, int $userId, ?AnalysisGroup $analysisGroup = null): Collection
    {
        $openPositions = OpenPosition::query()
            ->with('analysisGroup')
            ->where('status', OpenPosition::STATUS_OPEN)
            ->where('amount', '>', 0)
            ->whereHas('analysisGroup', fn($query) => $query->where('user_id', $userId))
            ->when($analysisGroup, function ($query) use ($analysisGroup): void {
                $query
                    ->where('source_analysis_group_id', '!=', $analysisGroup->id)
                    ->whereDoesntHave('usages', fn($query) => $query->where('analysis_group_id', $analysisGroup->id));
            })
            ->latest()
            ->get();

        return $transactions
            ->concat($openPositions)
            ->sortByDesc(fn(Transaction|OpenPosition $item) => $item instanceof Transaction ? $item->executed_at : $item->created_at)
            ->values();
    }
}
