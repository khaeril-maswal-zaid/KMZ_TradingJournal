<?php

namespace App\Models;

use Database\Factories\TransactionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Transaction extends Model
{
    /** @use HasFactory<TransactionFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'pair',
        'base_asset',
        'quote_asset',
        'type',
        'price',
        'amount',
        'total',
        'fee_amount',
        'fee_coin',
        'executed_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:10',
            'amount' => 'decimal:10',
            'total' => 'decimal:10',
            'fee_amount' => 'decimal:10',
            'executed_at' => 'datetime',
        ];
    }

    public function analysisGroups(): BelongsToMany
    {
        return $this->belongsToMany(AnalysisGroup::class, 'analysis_group_transactions')
            ->withTimestamps();
    }

    public function analysisGroupAssignment(): HasOne
    {
        return $this->hasOne(AnalysisGroupTransaction::class);
    }
}
