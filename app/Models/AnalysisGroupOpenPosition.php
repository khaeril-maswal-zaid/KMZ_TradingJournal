<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalysisGroupOpenPosition extends Model
{
    protected $fillable = [
        'analysis_group_id',
        'open_position_id',
    ];


    public function analysisGroup(): BelongsTo
    {
        return $this->belongsTo(AnalysisGroup::class);
    }

    public function openPosition(): BelongsTo
    {
        return $this->belongsTo(OpenPosition::class);
    }
}
