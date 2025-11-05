<?php

namespace App\Http\Requests\Config;

use Illuminate\Foundation\Http\FormRequest;

class StoreConfigRequest extends FormRequest
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
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp',
            'text_top' => ['nullable', 'string', 'max:255'],
            'text_top_color' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'bg_top_color' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'text_bottom' => ['nullable', 'string', 'max:255'],
            'text_bottom_color' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'bg_bottom_color' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'bg_middle_color' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'table_header_color' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'table_row_odd_color' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'table_row_even_color' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'table_text_color' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'table_text_active_color' => ['nullable', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'photo.image' => 'Tệp tải lên phải là hình ảnh.',
            'photo.mimes' => 'Ảnh phải có định dạng: jpeg, png, jpg, gif, hoặc webp.',
            'text_top.max' => 'Tiêu đề trên tối đa 255 ký tự.',
            'text_bottom.max' => 'Tiêu đề dưới tối đa 255 ký tự.',
            'text_top_color.regex' => 'Màu chữ tiêu đề trên không hợp lệ. Dùng #RRGGBB hoặc #RGB.',
            'bg_top_color.regex' => 'Màu nền tiêu đề trên không hợp lệ. Dùng #RRGGBB hoặc #RGB.',
            'text_bottom_color.regex' => 'Màu chữ tiêu đề dưới không hợp lệ. Dùng #RRGGBB hoặc #RGB.',
            'bg_bottom_color.regex' => 'Màu nền tiêu đề dưới không hợp lệ. Dùng #RRGGBB hoặc #RGB.',
            'bg_middle_color.regex' => 'Màu nền giữa không hợp lệ. Dùng #RRGGBB hoặc #RGB.',
            'table_header_color.regex' => 'Màu header bảng không hợp lệ. Dùng #RRGGBB hoặc #RGB.',
            'table_row_odd_color.regex' => 'Màu dòng lẻ không hợp lệ. Dùng #RRGGBB hoặc #RGB.',
            'table_row_even_color.regex' => 'Màu dòng chẵn không hợp lệ. Dùng #RRGGBB hoặc #RGB.',
            'table_text_color.regex' => 'Màu chữ bảng không hợp lệ. Dùng #RRGGBB hoặc #RGB.',
            'table_text_active_color.regex' => 'Màu chữ đang gọi không hợp lệ. Dùng #RRGGBB hoặc #RGB.',
        ];
    }
}
