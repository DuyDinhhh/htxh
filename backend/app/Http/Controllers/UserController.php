<?php

namespace App\Http\Controllers;
use App\Models\User;
use App\Http\Requests\User\ChangePasswordRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function changePassword(ChangePasswordRequest $request, $id)
    {             
        $user = User::findOrFail($id);
        if(!$user){
            return response()->json([
                'status' => false,
                'message'=> "User not found."
            ]);
        }
        
        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mật khẩu hiện tại không đúng.'],
            ]);
        }

        $user->password = Hash::make($request->password); 
        $user->save();
 
        return response()->json([
            'status' => true,
            'message' => 'Password change successfully',
            'user' => $user,
        ]);
    }
}
