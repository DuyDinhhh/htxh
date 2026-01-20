<?php

namespace App\Http\Requests\Ticket;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'adapter_type' => 'nullable|string|max:20|in:QR_CODE,NFC,FACE,FINGERPRINT',
            'data.cccd' => 'required|string|max:20',
            'data.cmnd' => 'nullable|string|max:20',
            'data.full_name' => 'nullable|string|max:255',
            'data.date_of_birth' => 'nullable|date',
            'data.sex' => 'nullable|string|max:10',
            'data.address' => 'nullable|string',
            'data.date_of_issue' => 'nullable|date',
        ];
    }

    public function customerData(): array
    {
        $data = $this->input('data', []);
        $data['adapter_type'] = $this->input('adapter_type');
        return $data;
    }


    public function messages(): array
    {
        return [
            'adapter_type.in' => 'Adapter type không hợp lệ',
            'data.cccd.required' => 'So cccd la bat buoc',
        ];
    }
}
