<?php

namespace App\Models;

use App\Traits\HasUuid;
use Database\Factories\AnalysisGroupFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnalysisGroup extends Model
{
    /** @use HasFactory<AnalysisGroupFactory> */
    use HasFactory;
    use HasUuid;

    protected $fillable = [
        'executed_at',
        'user_id',
        'total_buy',
        'total_buy_amount',
        'average_buy_price',
        'total_sell',
        'total_sell_amount',
        'average_sell_price',
        'profit',
        'roi_percent',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'total_buy' => 'decimal:10',
            'total_buy_amount' => 'decimal:10',
            'average_buy_price' => 'decimal:10',
            'total_sell' => 'decimal:10',
            'total_sell_amount' => 'decimal:10',
            'average_sell_price' => 'decimal:10',
            'profit' => 'decimal:10',
            'roi_percent' => 'decimal:4',
            'executed_at' => 'datetime',
        ];
    }

    public function transactions(): BelongsToMany
    {
        return $this->belongsToMany(Transaction::class, 'analysis_group_transactions')
            ->withTimestamps();
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(AnalysisGroupTransaction::class);
    }

    public function openPositions(): HasMany
    {
        return $this->hasMany(OpenPosition::class, 'source_analysis_group_id');
    }

    public function openPositionAllocations(): HasMany
    {
        return $this->hasMany(AnalysisGroupOpenPosition::class);
    }

    public function allocatedOpenPositions(): BelongsToMany
    {
        return $this->belongsToMany(OpenPosition::class, 'analysis_group_open_positions')
            ->withPivot(['allocated_amount', 'allocated_total'])
            ->withTimestamps();
    }
}
