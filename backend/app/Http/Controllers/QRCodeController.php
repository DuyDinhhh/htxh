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
        $randomId = Str::random(10);  
        Cache::put($randomId, 'valid', self::QR_VALIDITY_DURATION); 
        return response()->json(['id' => $randomId]);
    }

    public function validateQR(Request $request)
    {
        $id = $request->query('id'); 
        if (Cache::has($id)) { 
            return response()->json([
                'status' => true,
            ]);
        } else { 
            return response()->json([
                'status' => false,
            ]);  
        }
    }
}
