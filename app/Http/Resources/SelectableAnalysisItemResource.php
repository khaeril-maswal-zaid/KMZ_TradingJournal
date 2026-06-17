<?php

namespace App\Http\Resources;

use App\Models\OpenPosition;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SelectableAnalysisItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if ($this->resource instanceof OpenPosition) {
            return [
                'id' => $this->id,
                'selection_id' => 'open_position:'.$this->id,
                'source' => 'OPEN_POSITION',
                'source_label' => 'POSISI TERBUKA',
                'pair' => $this->asset.'/USDT',
                'base_asset' => $this->asset,
                'quote_asset' => 'USDT',
                'type' => 'BUY',
                'price' => (float) $this->buy_price,
                'amount' => (float) $this->remaining_amount,
                'max_allocatable_amount' => (float) $this->remaining_amount,
                'total' => (float) $this->total,
                'fee_amount' => 0,
                'fee_coin' => null,
                'executed_at' => $this->created_at?->toIso8601String(),
                'executed_at_label' => $this->created_at?->timezone('UTC')->format('d M Y H:i').' UTC',
                'notes' => null,
                'is_analyzed' => false,
                'analysis_group' => $this->whenLoaded('analysisGroup', fn () => [
                    'key' => $this->analysisGroup->key_analysis_group,
                ]),
            ];
        }

        return [
            'id' => $this->id,
            'selection_id' => 'transaction:'.$this->id,
            'source' => 'TRANSACTION',
            'source_label' => $this->type,
            'pair' => $this->pair,
            'base_asset' => $this->base_asset,
            'quote_asset' => $this->quote_asset,
            'type' => $this->type,
            'price' => (float) $this->price,
            'amount' => (float) $this->amount,
            'max_allocatable_amount' => (float) $this->amount,
            'total' => (float) $this->total,
            'fee_amount' => (float) $this->fee_amount,
            'fee_coin' => $this->fee_coin,
            'executed_at' => $this->executed_at?->toIso8601String(),
            'executed_at_label' => $this->executed_at?->timezone('UTC')->format('d M Y H:i').' UTC',
            'notes' => $this->notes,
            'is_analyzed' => (bool) $this->analysisGroupAssignment?->analysis_group_id,
            'analysis_group' => $this->whenLoaded('analysisGroupAssignment', fn () => $this->analysisGroupAssignment?->analysisGroup ? [
                'key' => $this->analysisGroupAssignment->analysisGroup->key_analysis_group,
            ] : null),
        ];
    }
}
