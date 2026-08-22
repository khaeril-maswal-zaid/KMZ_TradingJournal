<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAnalysisGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transaction_ids' => ['nullable', 'array'],
            'transaction_ids.*' => ['string', 'exists:transactions,uuid', 'unique:analysis_group_transactions,transaction_id'],
            'open_position_allocations' => ['nullable', 'array'],
            'open_position_allocations.*' => ['required', 'string', 'exists:open_positions,uuid',  'unique:analysis_group_transactions,transaction_id'],

        ];
    }

    public function messages(): array
    {
        return [
            'transaction_ids.array' => 'Daftar transaksi tidak valid.',
            'transaction_ids.*.exists' => 'Transaksi yang dipilih tidak ditemukan.',
            'transaction_ids.*.unique' => 'Transaksi sudah masuk ke grup analisa lain.',
            'open_position_allocations.array' => 'Daftar posisi terbuka tidak valid.',
        ];
    }
}
