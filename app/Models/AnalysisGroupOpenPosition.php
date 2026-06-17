<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalysisGroupOpenPosition extends Model
{
    protected $fillable = [
        'analysis_group_id',
        'open_position_id',
        'allocated_amount',
        'allocated_total',
    ];

    protected function casts(): array
    {
        return [
            'allocated_amount' => 'decimal:10',
            'allocated_total' => 'decimal:10',
        ];
    }

    public function analysisGroup(): BelongsTo
    {
        return $this->belongsTo(AnalysisGroup::class);
    }

    public function openPosition(): BelongsTo
    {
        return $this->belongsTo(OpenPosition::class);
    }
}
