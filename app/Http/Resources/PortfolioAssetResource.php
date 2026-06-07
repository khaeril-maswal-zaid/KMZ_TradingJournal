<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PortfolioAssetResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'asset' => $this->resource['asset'],
            'pair' => $this->resource['pair'],
            'remaining_amount' => $this->resource['remaining_amount'],
            'average_buy_price' => $this->resource['average_buy_price'],
            'cost_basis' => $this->resource['cost_basis'],
            'estimated_value' => $this->resource['estimated_value'],
            'unrealized_pnl' => $this->resource['unrealized_pnl'],
            'last_updated' => $this->resource['last_updated']?->toIso8601String(),
            'last_updated_label' => $this->resource['last_updated']?->timezone('UTC')->format('d M Y H:i') . ' UTC',
        ];
    }
}
