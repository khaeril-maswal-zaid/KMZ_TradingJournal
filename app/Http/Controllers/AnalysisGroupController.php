<?php

namespace App\Http\Controllers;

use App\Http\Requests\AttachAnalysisGroupTransactionsRequest;
use App\Http\Requests\StoreAnalysisGroupRequest;
use App\Http\Resources\AnalysisGroupResource;
use App\Http\Resources\TransactionResource;
use App\Models\AnalysisGroup;
use App\Models\AnalysisGroupTransaction;
use App\Models\Transaction;
use App\Services\AnalysisGroupCalculationService;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AnalysisGroupController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('analysis-groups/index', [
            'groups' => AnalysisGroupResource::collection(
                AnalysisGroup::query()
                    ->withCount('transactions')
                    ->latest()
                    ->paginate(12)
            ),

            'availableTransactions' => TransactionResource::collection(
                Transaction::query()
                    ->doesntHave('analysisGroupAssignment')
                    ->latest('executed_at')
                    // ->limit(20)
                    ->get()
            ),
        ]);
    }

    public function store(StoreAnalysisGroupRequest $request, AnalysisGroupCalculationService $calculator): RedirectResponse
    {
        $group = AnalysisGroup::create(
            ['user_id' => Auth::id()],
            $request->validated(),
        );

        if ($request->filled('transaction_ids')) {
            $this->attachTransactions($group, $request->validated('transaction_ids'));
        }

        $calculator->recalculate($group);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Grup analisa berhasil dibuat.']);

        return to_route('tradematching.show', $group);
    }

    public function show(AnalysisGroup $analysisGroup, AnalysisGroupCalculationService $calculator): Response
    {
        $analysisGroup->load([
            'transactions' => fn($query) => $query->orderBy('executed_at'),
        ])->loadCount('transactions');

        $buyTransactions = $analysisGroup->transactions->where('type', 'BUY')->values();
        $sellTransactions = $analysisGroup->transactions->where('type', 'SELL')->values();

        return Inertia::render('analysis-groups/show', [
            'group' => AnalysisGroupResource::make($analysisGroup),
            'buyTransactions' => TransactionResource::collection($buyTransactions),
            'sellTransactions' => TransactionResource::collection($sellTransactions),
            'sellPlannerSummary' => $calculator->sellPlannerSummary($buyTransactions),
            'availableTransactions' => TransactionResource::collection(
                Transaction::query()
                    ->with('analysisGroupAssignment.analysisGroup')
                    ->latest('executed_at')
                    ->limit(80)
                    ->get()
            ),
        ]);
    }

    public function attach(AnalysisGroup $analysisGroup, AttachAnalysisGroupTransactionsRequest $request, AnalysisGroupCalculationService $calculator): RedirectResponse
    {
        try {
            $this->attachTransactions($analysisGroup, $request->validated('transaction_ids'));
        } catch (QueryException) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Transaksi sudah masuk ke grup analisa lain.']);

            return back();
        }

        $calculator->recalculate($analysisGroup);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Transaksi berhasil dimasukkan ke grup analisa.']);

        return back();
    }

    public function detach(AnalysisGroup $analysisGroup, Transaction $transaction, AnalysisGroupCalculationService $calculator): RedirectResponse
    {
        $analysisGroup->transactions()->detach($transaction->id);
        $calculator->recalculate($analysisGroup);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Transaksi berhasil dihapus dari grup analisa.']);

        return back();
    }

    public function destroy(AnalysisGroup $analysisGroup): RedirectResponse
    {
        // detach all transactions first to avoid foreign key issues
        $analysisGroup->transactions()->detach();

        AnalysisGroup::destroy($analysisGroup->id);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Grup analisa berhasil dihapus.']);

        return to_route('tradematching.index');
    }

    /**
     * @param  array<int, int>  $transactionIds
     */
    private function attachTransactions(AnalysisGroup $analysisGroup, array $transactionIds): void
    {
        foreach (array_unique($transactionIds) as $transactionId) {
            AnalysisGroupTransaction::create([
                'analysis_group_id' => $analysisGroup->id,
                'transaction_id' => $transactionId,
            ]);
        }
    }
}
