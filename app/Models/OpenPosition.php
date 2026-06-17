<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OpenPosition extends Model
{
    public const STATUS_OPEN = 'OPEN';

    public const STATUS_CLOSED = 'CLOSED';

    protected $fillable = [
        'source_analysis_group_id',
        'asset',
        'buy_price',
        'original_amount',
        'remaining_amount',
        'total',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'buy_price' => 'decimal:10',
            'original_amount' => 'decimal:10',
            'remaining_amount' => 'decimal:10',
            'total' => 'decimal:10',
        ];
    }

    public function analysisGroup(): BelongsTo
    {
        return $this->belongsTo(AnalysisGroup::class, 'source_analysis_group_id');
    }

    public function usages(): HasMany
    {
        return $this->hasMany(AnalysisGroupOpenPosition::class);
    }

    public function usedByAnalysisGroups(): BelongsToMany
    {
        return $this->belongsToMany(AnalysisGroup::class, 'analysis_group_open_positions')
            ->withPivot(['allocated_amount', 'allocated_total'])
            ->withTimestamps();
    }
}
