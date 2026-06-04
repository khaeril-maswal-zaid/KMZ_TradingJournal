<?php

namespace App\Http\Requests;

use App\Services\TransactionImportService;
use Illuminate\Foundation\Http\FormRequest;

class ImportTransactionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transactions' => ['required', 'array', 'min:1'],
            'transactions.*.executed_at' => ['required', 'date'],
            'transactions.*.pair' => ['required', 'string', 'max:30'],
            'transactions.*.base_asset' => ['required', 'string', 'max:20'],
            'transactions.*.quote_asset' => ['required', 'string', 'max:20'],
            'transactions.*.type' => ['required', 'in:BUY,SELL'],
            'transactions.*.price' => ['required', 'numeric'],
            'transactions.*.amount' => ['required', 'numeric'],
            'transactions.*.total' => ['required', 'numeric'],
            'transactions.*.fee_amount' => ['nullable', 'numeric'],
            'transactions.*.fee_coin' => ['nullable', 'string', 'max:20'],
            'transactions.*.notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $service = app(TransactionImportService::class);

        $this->merge([
            'transactions' => collect($this->input('transactions', []))
                ->map(function (array $transaction) use ($service): array {
                    foreach (['price', 'amount', 'total', 'fee_amount'] as $field) {
                        if (array_key_exists($field, $transaction)) {
                            $transaction[$field] = $service->normalizeDecimal($transaction[$field]);
                        }
                    }

                    if (isset($transaction['type'])) {
                        $transaction['type'] = strtoupper((string) $transaction['type']);
                    }

                    return $transaction;
                })
                ->all(),
        ]);
    }

    public function messages(): array
    {
        return [
            'transactions.required' => 'Data transaksi wajib diisi.',
            'transactions.array' => 'Format data transaksi tidak valid.',
            'transactions.min' => 'Minimal satu transaksi wajib diimport.',
            'transactions.*.executed_at.required' => 'Tanggal transaksi wajib diisi.',
            'transactions.*.executed_at.date' => 'Tanggal transaksi tidak valid.',
            'transactions.*.pair.required' => 'Pair wajib diisi.',
            'transactions.*.base_asset.required' => 'Base asset wajib diisi.',
            'transactions.*.quote_asset.required' => 'Quote asset wajib diisi.',
            'transactions.*.type.required' => 'Tipe transaksi wajib dipilih.',
            'transactions.*.type.in' => 'Tipe transaksi harus BUY atau SELL.',
            'transactions.*.price.required' => 'Harga wajib diisi.',
            'transactions.*.price.numeric' => 'Harga harus berupa angka.',
            'transactions.*.amount.required' => 'Jumlah wajib diisi.',
            'transactions.*.amount.numeric' => 'Jumlah harus berupa angka.',
            'transactions.*.total.required' => 'Total wajib diisi.',
            'transactions.*.total.numeric' => 'Total harus berupa angka.',
            'transactions.*.fee_amount.numeric' => 'Fee harus berupa angka.',
        ];
    }
}
