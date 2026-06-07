<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnalysisGroupResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'executed_at' => $this->executed_at?->timezone('UTC')->format('d M Y H:i') . ' UTC',
            'key' => $this->key_analysis_group,
            'total_buy' => (float) $this->total_buy,
            'total_buy_amount' => (float) $this->total_buy_amount,
            'average_buy_price' => (float) $this->average_buy_price,
            'total_sell' => (float) $this->total_sell,
            'total_sell_amount' => (float) $this->total_sell_amount,
            'average_sell_price' => (float) $this->average_sell_price,
            'profit' => (float) $this->profit,
            'roi_percent' => (float) $this->roi_percent,
            'status' => $this->status,
            'transactions_count' => $this->transactions_count ?? $this->transactions()->count(),
            'created_at' => $this->created_at?->toIso8601String(),
            'created_at_label' => $this->created_at?->format('d M Y'),
            // 'transactions' => TransactionResource::collection($this->whenLoaded('transactions')),
        ];
    }
}
