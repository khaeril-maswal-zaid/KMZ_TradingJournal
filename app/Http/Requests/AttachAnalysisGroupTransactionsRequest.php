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
            'transaction_ids' => ['required', 'array', 'min:1'],
            'transaction_ids.*' => ['integer', 'exists:transactions,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'transaction_ids.required' => 'Pilih minimal satu transaksi.',
            'transaction_ids.array' => 'Daftar transaksi tidak valid.',
            'transaction_ids.min' => 'Pilih minimal satu transaksi.',
            'transaction_ids.*.exists' => 'Transaksi yang dipilih tidak ditemukan.',
        ];
    }
}
