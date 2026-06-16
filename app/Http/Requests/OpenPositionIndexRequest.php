<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OpenPositionIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(['all', 'OPEN', 'CLOSED'])],
        ];
    }

    /**
     * @return array{search: string, status: string}
     */
    public function filters(): array
    {
        return [
            'search' => $this->string('search')->toString(),
            'status' => $this->string('status')->toString() ?: 'all',
        ];
    }
}
