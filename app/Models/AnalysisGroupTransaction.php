<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalysisGroupTransaction extends Model
{
    protected $fillable = [
        'analysis_group_id',
        'transaction_id',
    ];

    public function analysisGroup(): BelongsTo
    {
        return $this->belongsTo(AnalysisGroup::class);
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }
}
