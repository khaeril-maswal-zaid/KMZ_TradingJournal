<?php

namespace App\Http\Controllers;

use App\Http\Resources\AnalysisGroupResource;
use App\Http\Resources\TransactionResource;
use App\Models\AnalysisGroup;
use App\Models\Transaction;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $totalBuy = (float) Transaction::where('type', 'BUY')->sum('total');
        $totalSell = (float) Transaction::where('type', 'SELL')->sum('total');
        $totalProfit = (float) AnalysisGroup::sum('profit');

        $monthlyProfit = AnalysisGroup::query()
            ->selectRaw("strftime('%Y-%m', created_at) as month, sum(profit) as profit")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($row) => [
                'month' => $row->month,
                'label' => date('M Y', strtotime($row->month.'-01')),
                'profit' => (float) $row->profit,
            ]);

        return Inertia::render('dashboard', [
            'stats' => [
                'total_profit' => $totalProfit,
                'total_buy' => $totalBuy,
                'total_sell' => $totalSell,
                'total_roi' => $totalBuy > 0 ? (($totalSell - $totalBuy) / $totalBuy) * 100 : 0,
                'transactions_count' => Transaction::count(),
                'analysis_groups_count' => AnalysisGroup::count(),
            ],
            'monthlyProfit' => $monthlyProfit,
            'recentTransactions' => TransactionResource::collection(
                Transaction::query()
                    ->with('analysisGroupAssignment.analysisGroup')
                    ->latest('executed_at')
                    ->limit(6)
                    ->get()
            ),
            'recentGroups' => AnalysisGroupResource::collection(
                AnalysisGroup::query()
                    ->withCount('transactions')
                    ->latest()
                    ->limit(5)
                    ->get()
            ),
        ]);
    }
}
