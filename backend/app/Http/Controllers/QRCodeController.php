<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;   

class QRCodeController extends Controller
{
    const QR_VALIDITY_DURATION = 30;
    public function generateNewQR()
    {
        $token = Str::random(20);
        $baseUrl = 'http://10.10.1.59:3000/ticket/create-qr';
        Cache::put($token, 'valid', self::QR_VALIDITY_DURATION);
        return response()->json([
            'url' => $baseUrl . '?token=' . $token
        ]);
    }

    public function validateQR(Request $request)
    {
        $token = $request->query('token');
        if (Cache::has($token)) { 
            // Cache::forget($token);
            return response()->json([
                'status' => true,
            ]);
        } else { 
            return response()->json([
                'status' => false,
            ]);  
        }
    }

        // public function validateQR(Request $request)
    // {

    //     if (!$token) {
    //         return redirect('http://10.10.1.59:3000/qr-invalid');
    //     }

    //     if (!Cache::has($token)) {
    //         return redirect('http://10.10.1.59:3000/qr-expired');
    //     }
    //     return redirect('http://10.10.1.59:3000/ticket/create-qr');
    // }
}
