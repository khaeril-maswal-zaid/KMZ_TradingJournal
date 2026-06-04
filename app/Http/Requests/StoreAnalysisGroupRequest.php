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
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'transaction_ids' => ['nullable', 'array'],
            'transaction_ids.*' => ['integer', 'exists:transactions,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama analisa wajib diisi.',
            'name.max' => 'Nama analisa maksimal 120 karakter.',
            'description.max' => 'Deskripsi maksimal 1000 karakter.',
            'transaction_ids.array' => 'Daftar transaksi tidak valid.',
            'transaction_ids.*.exists' => 'Transaksi yang dipilih tidak ditemukan.',
        ];
    }
}
