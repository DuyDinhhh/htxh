<?php

namespace App\Http\Requests\Service;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */

    public function rules(): array
    {
        return [
            'queue_number' => [
                'required',
                'numeric',
                Rule::unique('services', 'queue_number')->ignore($this->route('id'))->whereNull('deleted_at'),
            ],
            'color' => [
                'nullable',                 
                'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/',  
            ],
        ];
    }

    public function messages(): array
    {
        return 
        [
            'queue_number.required' => 'Mã dịch vụ là bắt buộc.',
            'queue_number.unique' => 'Mã dịch vụ đã tồn tại.',
            'queue_number.numeric'=>'Mã dịch vụ phải là chữ số.',
            'color.regex' => 'Màu sắc không hợp lệ. Vui lòng nhập đúng định dạng #RRGGBB hoặc #RGB.',
        ];
    }
}
