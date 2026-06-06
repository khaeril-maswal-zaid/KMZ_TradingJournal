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
        'key_analysis_group',
        'total_buy',
        'total_sell',
        'profit',
        'roi_percent',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'total_buy' => 'decimal:10',
            'total_sell' => 'decimal:10',
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
}
