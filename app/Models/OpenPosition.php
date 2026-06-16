<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OpenPosition extends Model
{
    public const STATUS_OPEN = 'OPEN';

    public const STATUS_CLOSED = 'CLOSED';

    protected $fillable = [
        'source_analysis_group_id',
        'asset',
        'buy_price',
        'amount',
        'total',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'buy_price' => 'decimal:10',
            'amount' => 'decimal:10',
            'total' => 'decimal:10',
        ];
    }

    public function analysisGroup(): BelongsTo
    {
        return $this->belongsTo(AnalysisGroup::class, 'source_analysis_group_id');
    }
}
