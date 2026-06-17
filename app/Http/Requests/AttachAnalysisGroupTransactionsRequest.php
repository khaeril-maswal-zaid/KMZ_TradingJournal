<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AttachAnalysisGroupTransactionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transaction_ids' => ['nullable', 'array'],
            'transaction_ids.*' => ['integer', 'exists:transactions,id'],
            'open_position_allocations' => ['nullable', 'array'],
            'open_position_allocations.*.open_position_id' => ['required', 'integer', 'exists:open_positions,id'],
            'open_position_allocations.*.allocated_amount' => ['required', 'numeric', 'gt:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'transaction_ids.array' => 'Daftar transaksi tidak valid.',
            'transaction_ids.*.exists' => 'Transaksi yang dipilih tidak ditemukan.',
            'open_position_allocations.array' => 'Daftar posisi terbuka tidak valid.',
            'open_position_allocations.*.open_position_id.exists' => 'Posisi terbuka yang dipilih tidak ditemukan.',
            'open_position_allocations.*.allocated_amount.gt' => 'Jumlah posisi terbuka harus lebih dari 0.',
        ];
    }
}
