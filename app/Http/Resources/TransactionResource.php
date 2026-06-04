<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'pair' => $this->pair,
            'base_asset' => $this->base_asset,
            'quote_asset' => $this->quote_asset,
            'type' => $this->type,
            'price' => (float) $this->price,
            'amount' => (float) $this->amount,
            'total' => (float) $this->total,
            'fee_amount' => (float) $this->fee_amount,
            'fee_coin' => $this->fee_coin,
            'executed_at' => $this->executed_at?->toIso8601String(),
            'executed_at_label' => $this->executed_at?->timezone('UTC')->format('d M Y H:i').' UTC',
            'notes' => $this->notes,
            'is_analyzed' => (bool) $this->analysisGroupAssignment?->analysis_group_id,
            'analysis_group' => $this->whenLoaded('analysisGroupAssignment', fn () => $this->analysisGroupAssignment?->analysisGroup ? [
                'id' => $this->analysisGroupAssignment->analysisGroup->id,
                'name' => $this->analysisGroupAssignment->analysisGroup->name,
            ] : null),
        ];
    }
}
