<?php

namespace App\Http\Controllers;

use App\Http\Requests\AttachAnalysisGroupTransactionsRequest;
use App\Http\Requests\StoreAnalysisGroupRequest;
use App\Http\Resources\AnalysisGroupResource;
use App\Http\Resources\SelectableAnalysisItemResource;
use App\Http\Resources\TransactionResource;
use App\Models\AnalysisGroup;
use App\Models\AnalysisGroupTransaction;
use App\Models\Transaction;
use App\Services\AnalysisGroupCalculationService;
use App\Services\AnalysisGroupSelectableItemService;
use App\Services\OpenPositionService;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalysisGroupController extends Controller
{
    public function index(AnalysisGroupSelectableItemService $selectableItems): Response
    {
        $includeOpenPositions = request()->boolean('include_open_positions');

        return Inertia::render('analysis-groups/index', [
            'groups' => AnalysisGroupResource::collection(
                AnalysisGroup::query()
                    ->where('user_id', Auth::id())
                    ->withCount('transactions')
                    ->latest('executed_at')
                    ->paginate(15)
            ),

            'availableTransactions' => SelectableAnalysisItemResource::collection(
                $selectableItems->forNewGroup($includeOpenPositions)
            ),
            'includeOpenPositions' => $includeOpenPositions,
        ]);
    }

    public function store(StoreAnalysisGroupRequest $request, AnalysisGroupCalculationService $calculator, OpenPositionService $openPositionService): RedirectResponse
    {
        $validated = $request->validated();
        $group = null;

        foreach ($request->transaction_uuids as $uuid) {
            $transactionId = Transaction::where('uuid', $uuid)->value('id');

            if (AnalysisGroupTransaction::where('transaction_id', $transactionId)->exists()) {
                Inertia::flash('toast', ['type' => 'error', 'message' => 'Transaksi sudah masuk ke grup analisa lain.']);

                return back();
            }
        }

        DB::transaction(function () use (&$group, $calculator, $openPositionService, $validated): void {
            $group = AnalysisGroup::create([
                'user_id' => Auth::id(),
            ]);

            if (! empty($validated['transaction_uuids'])) {
                $this->attachTransactions($group, $validated['transaction_uuids']);
            }

            if (! empty($validated['open_position_allocations'])) {
                $openPositionService->allocateToGroup($group, $validated['open_position_allocations']);
            }

            $calculator->recalculate($group);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Grup analisa berhasil dibuat.']);

        // return to_route('tradematching.index');
        return to_route('tradematching.show', $group);
    }

    public function show(AnalysisGroup $analysisGroup, AnalysisGroupCalculationService $calculator, AnalysisGroupSelectableItemService $selectableItems): Response
    {
        $includeOpenPositions = request()->boolean('include_open_positions');

        $analysisGroup->load([
            'transactions' => fn($query) => $query->orderBy('executed_at'),
            'openPositionAllocations.openPosition',
        ])->loadCount('transactions');

        $buyTransactions = $analysisGroup->transactions->where('type', 'BUY')->values();
        $sellTransactions = $analysisGroup->transactions->where('type', 'SELL')->values();

        return Inertia::render('analysis-groups/show', [
            'group' => AnalysisGroupResource::make($analysisGroup),
            'buyTransactions' => TransactionResource::collection($buyTransactions),
            'sellTransactions' => TransactionResource::collection($sellTransactions),
            'sellPlannerSummary' => $calculator->sellPlannerSummary($buyTransactions, $analysisGroup->openPositionAllocations),
            'availableTransactions' => SelectableAnalysisItemResource::collection(
                $selectableItems->forExistingGroup($analysisGroup, $includeOpenPositions)
            ),
            'includeOpenPositions' => $includeOpenPositions,
        ]);
    }

    public function attach(AnalysisGroup $analysisGroup, AttachAnalysisGroupTransactionsRequest $request, AnalysisGroupCalculationService $calculator, OpenPositionService $openPositionService): RedirectResponse
    {
        $validated = $request->validated();

        try {
            DB::transaction(function () use ($analysisGroup, $calculator, $openPositionService, $validated): void {
                if (! empty($validated['transaction_uuids'])) {
                    $this->attachTransactions($analysisGroup, $validated['transaction_uuids']);
                }

                if (! empty($validated['open_position_allocations'])) {
                    $openPositionService->allocateToGroup($analysisGroup, $validated['open_position_allocations']);
                }

                $calculator->recalculate($analysisGroup);
            });
        } catch (QueryException) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Transaksi sudah masuk ke grup analisa lain.']);

            return back();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Item berhasil dimasukkan ke grup analisa.']);

        return back();
    }

    public function detach(AnalysisGroup $analysisGroup, Transaction $transaction, AnalysisGroupCalculationService $calculator): RedirectResponse
    {
        $analysisGroup->transactions()->detach($transaction->id);
        $calculator->recalculate($analysisGroup);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Transaksi berhasil dihapus dari grup analisa.']);

        return back();
    }

    public function destroy(AnalysisGroup $analysisGroup, OpenPositionService $openPositionService): RedirectResponse
    {
        $openPositionService->releaseAllocations($analysisGroup);

        // detach all transactions first to avoid foreign key issues
        $analysisGroup->transactions()->detach();

        $analysisGroup->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Grup analisa berhasil dihapus.']);

        return to_route('tradematching.index');
    }

    /**
     * @param  array<int, int>  $transactionUuids
     */
    private function attachTransactions(AnalysisGroup $analysisGroup, array $transactionUuids): void
    {
        $transactions = Transaction::query()
            ->whereIn('uuid', array_unique($transactionUuids))
            ->pluck('id');

        foreach ($transactions as $transactionId) {
            AnalysisGroupTransaction::create([
                'analysis_group_id' => $analysisGroup->id,
                'transaction_id' => $transactionId,
            ]);
        }
    }
}
