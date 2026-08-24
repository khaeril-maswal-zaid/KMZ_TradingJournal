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
            'transaction_uuids' => ['nullable', 'array'],
            'transaction_uuids.*' => ['string', 'exists:transactions,uuid'],
            'open_position_allocations' => ['nullable', 'array'],
            'open_position_allocations.*' => ['required', 'string', 'exists:open_positions,uuid'],

        ];
    }

    public function messages(): array
    {
        return [
            'transaction_uuids.array' => 'Daftar transaksi tidak valid.',
            'transaction_uuids.*.exists' => 'Transaksi yang dipilih tidak ditemukan.',
            'open_position_allocations.array' => 'Daftar posisi terbuka tidak valid.',
        ];
    }
}
