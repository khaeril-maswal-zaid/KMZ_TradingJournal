<?php

namespace App\Http\Controllers;

use App\Http\Resources\AnalysisGroupResource;
use App\Http\Resources\PortfolioAssetResource;
use App\Http\Resources\TransactionResource;
use App\Models\AnalysisGroup;
use App\Models\Transaction;
use App\Services\PortfolioSummaryService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(PortfolioSummaryService $portfolioService): Response
    {
        $user = Auth::user();
        $totalBuy = (float) Transaction::where('user_id', $user->id)->where('type', 'BUY')->sum('total');
        $totalSell = (float) Transaction::where('user_id', $user->id)->where('type', 'SELL')->sum('total');
        $totalProfit = (float) AnalysisGroup::where('user_id', $user->id)->sum('profit');

        $monthlyProfit = AnalysisGroup::query()
            ->where('user_id', $user->id)
            // ->selectRaw("strftime('%Y-%m', executed_at) as month, sum(profit) as profit")
            ->selectRaw("DATE_FORMAT(executed_at, '%Y-%m') as month, SUM(profit) as profit")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn($row) => [
                'month' => $row->month,
                'label' => date('M Y', strtotime($row->month . '-01')),
                'profit' => (float) $row->profit,
            ]);

        // Get portfolio assets summary
        $portfolioAssets = $portfolioService->getAssetsSummary($user);

        return Inertia::render('dashboard', [
            'stats' => [
                'total_profit' => $totalProfit,
                'total_buy' => $totalBuy,
                'total_sell' => $totalSell,
                'total_roi' => $totalBuy > 0 ? (($totalSell - $totalBuy) / $totalBuy) * 100 : 0,
                'transactions_count' => Transaction::where('user_id', $user->id)->count(),
                'analysis_groups_count' => AnalysisGroup::where('user_id', $user->id)->count(),
            ],

            'monthlyProfit' => $monthlyProfit,
            'portfolioAssets' => PortfolioAssetResource::collection($portfolioAssets),

            'recentGroups' => AnalysisGroupResource::collection(
                AnalysisGroup::query()
                    ->where('user_id', $user->id)
                    ->withCount('transactions')
                    ->latest()
                    ->limit(5)
                    ->get()
            ),
        ]);
    }
}
