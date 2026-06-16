<?php

namespace App\Http\Controllers;

use App\Http\Requests\OpenPositionIndexRequest;
use App\Http\Resources\OpenPositionResource;
use App\Models\OpenPosition;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OpenPositionController extends Controller
{
    public function index(OpenPositionIndexRequest $request): Response
    {
        $filters = $request->filters();

        $query = OpenPosition::query()
            ->with('analysisGroup')
            ->whereHas('analysisGroup', fn (Builder $query) => $query->where('user_id', Auth::id()))
            ->when($filters['search'], function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->where('asset', 'like', "%{$search}%")
                        ->orWhereHas('analysisGroup', fn (Builder $query) => $query->where('key_analysis_group', 'like', "%{$search}%"));
                });
            })
            ->when(in_array($filters['status'], [OpenPosition::STATUS_OPEN, OpenPosition::STATUS_CLOSED], true), fn (Builder $query) => $query->where('status', $filters['status']));

        $summaryQuery = OpenPosition::query()
            ->where('status', OpenPosition::STATUS_OPEN)
            ->whereHas('analysisGroup', fn (Builder $query) => $query->where('user_id', Auth::id()));

        return Inertia::render('open-positions/index', [
            'positions' => OpenPositionResource::collection(
                $query
                    ->orderByRaw("CASE WHEN status = 'OPEN' THEN 0 ELSE 1 END")
                    ->latest()
                    ->paginate(15)
                    ->withQueryString()
            ),
            'filters' => $filters,
            'summary' => [
                'open_positions_count' => (clone $summaryQuery)->count(),
                'total_open_value' => (float) (clone $summaryQuery)->sum('total'),
                'unique_assets_count' => (clone $summaryQuery)->distinct('asset')->count('asset'),
            ],
        ]);
    }
}
