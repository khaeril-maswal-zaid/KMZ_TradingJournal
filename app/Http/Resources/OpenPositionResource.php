<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OpenPositionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'asset' => $this->asset,
            'buy_price' => (float) $this->buy_price,
            'amount' => (float) $this->amount,
            'total' => (float) $this->total,
            'status' => $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
            'created_at_label' => $this->created_at?->format('d M Y'),
            'analysis_group' => $this->whenLoaded('analysisGroup', fn () => [
                'id' => $this->analysisGroup->id,
                'key' => $this->analysisGroup->key_analysis_group,
                'name' => $this->analysisGroup->key_analysis_group,
            ]),
        ];
    }
}
