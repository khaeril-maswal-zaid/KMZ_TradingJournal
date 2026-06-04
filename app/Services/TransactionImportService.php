<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TransactionImportService
{
    /**
     * @param  array<int, array<string, mixed>>  $rows
     * @return Collection<int, Transaction>
     */
    public function import(array $rows): Collection
    {
        return DB::transaction(function () use ($rows): Collection {
            return collect($rows)->map(function (array $row): Transaction {
                return Transaction::create([
                    'pair' => strtoupper((string) $row['pair']),
                    'base_asset' => strtoupper((string) $row['base_asset']),
                    'quote_asset' => strtoupper((string) $row['quote_asset']),
                    'type' => strtoupper((string) $row['type']),
                    'price' => $this->normalizeDecimal($row['price']),
                    'amount' => $this->normalizeDecimal($row['amount']),
                    'total' => $this->normalizeDecimal($row['total']),
                    'fee_amount' => $this->normalizeDecimal($row['fee_amount'] ?? 0),
                    'fee_coin' => filled($row['fee_coin'] ?? null) ? strtoupper((string) $row['fee_coin']) : null,
                    'executed_at' => $row['executed_at'],
                    'notes' => $row['notes'] ?? null,
                ]);
            });
        });
    }

    public function normalizeDecimal(mixed $value): string
    {
        if ($value === null || $value === '') {
            return '0';
        }

        $normalized = trim((string) $value);
        $normalized = str_replace(' ', '', $normalized);

        if (str_contains($normalized, ',') && str_contains($normalized, '.')) {
            $lastComma = strrpos($normalized, ',');
            $lastDot = strrpos($normalized, '.');

            if ($lastComma > $lastDot) {
                $normalized = str_replace('.', '', $normalized);
                $normalized = str_replace(',', '.', $normalized);
            } else {
                $normalized = str_replace(',', '', $normalized);
            }
        } else {
            $normalized = str_replace(',', '.', $normalized);
        }

        return $normalized;
    }
}
