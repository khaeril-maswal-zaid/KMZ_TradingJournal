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
            'transaction_ids.*' => ['integer', 'exists:transactions,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'transaction_ids.array' => 'Daftar transaksi tidak valid.',
            'transaction_ids.*.exists' => 'Transaksi yang dipilih tidak ditemukan.',
        ];
    }
}
