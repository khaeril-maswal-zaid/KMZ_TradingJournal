<?php

namespace App\Http\Controllers;

use App\Http\Requests\ImportTransactionsRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Services\TransactionImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Transaction::query()
            ->with('analysisGroupAssignment.analysisGroup')
            ->when($request->string('search')->toString(), function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('pair', 'like', "%{$search}%")
                        ->orWhere('base_asset', 'like', "%{$search}%")
                        ->orWhere('quote_asset', 'like', "%{$search}%");
                });
            })
            ->when(in_array($request->string('type')->toString(), ['BUY', 'SELL'], true), fn($query) => $query->where('type', $request->string('type')->toString()))
            ->when($request->string('analysis')->toString() === 'analyzed', fn($query) => $query->whereHas('analysisGroupAssignment'))
            ->when($request->string('analysis')->toString() === 'unreviewed', fn($query) => $query->doesntHave('analysisGroupAssignment'));

        $sort = $request->string('sort')->toString();
        $direction = $request->string('direction')->toString() === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['executed_at', 'pair', 'type', 'price', 'amount', 'total'];

        $query->orderBy(in_array($sort, $allowedSorts, true) ? $sort : 'executed_at', $direction);

        return Inertia::render('transactions/index', [
            'transactions' => TransactionResource::collection($query->paginate(12)->withQueryString()),
            'filters' => [
                'search' => $request->string('search')->toString(),
                'type' => $request->string('type')->toString() ?: 'ALL',
                'analysis' => $request->string('analysis')->toString() ?: 'all',
                'sort' => $sort ?: 'executed_at',
                'direction' => $direction,
            ],
        ]);
    }

    public function import(): Response
    {
        return Inertia::render('transactions/import');
    }

    public function storeImport(ImportTransactionsRequest $request, TransactionImportService $service): RedirectResponse
    {
        $transactions = $service->import($request->validated('transactions'));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $transactions->count() . ' transaksi berhasil diimport.',
        ]);

        return to_route('transactions.index');
    }
}
