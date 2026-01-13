<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Models\UserActivityLog;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'username' => $request->username,
            'password' => $request->password,  
        ]);

        try {
            $token = JWTAuth::fromUser($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not create token'], 500);
        }

        return response()->json([
            'token' => $token,
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $credentials = [
            'username' => $request->input('username'),
            'password' => $request->input('password'),
        ];

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(['error' => 'Thông tin đăng nhập không đúng'], 401);
            }
        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not create token'], 500);
        }
        $user = Auth::user();
        return response()->json([
            'token' => $token,
            'user' => $user,
            'expires_in' => auth('api')->factory()->getTTL() * 60,
        ]);
    }

    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to logout, please try again'], 500);
        }

        return response()->json(['message' => 'Successfully logged out']);
    }

    public function getUser()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }
            return response()->json($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to fetch user profile'], 500);
        }
    }

    public function updateUser(Request $request)
    {
        try {
            $user = Auth::user();
            $request->validate([
                'username' => 'nullable|string|max:255|unique:users,username,' . $user->id,
                'password' => 'nullable|string|min:6|confirmed',
            ]);
            $input = $request->only(['name', 'username', 'email', 'photo']);
            if ($request->filled('password')) {
                $input['password'] = $request->password;
            }
            $user->update($input);
            return response()->json($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to update user'], 500);
        }
    }

    public function authenticate(AuthenticateRequest $request)
    {
        $adapterType = $request->adapter_type;
        $data = $request->data;

        $isValid = $this->validateAuthenticationData($adapterType, $data);

        // Store the authentication result in the database (if needed)
        $authRecord = AuthenticationRecord::create([
            'adapter_type' => $adapterType,
            'data' => $data,
        ]);

        // Prepare the response
        $response = [
            'status' => $isValid ? 'success' : 'failure',
            'message' => $isValid ? 'Authentication successful' : 'Authentication failed',
            'data' => $authRecord, // Return the stored record if needed
        ];

        // Return the response
        return response()->json($response);
    }

    private function validateAuthenticationData(string $adapterType, string $data)
    {
        switch ($adapterType) {
            case 'QR':
                return $this->validateQR($data);
            case 'NFC':
                return $this->validateNFC($data);
            case 'Face':
                return $this->validateFace($data);
            case 'Fingerprint':
                return $this->validateFingerprint($data);
            default:
                return false;
        }
    }

    private function validateQR($data)
    {
        return $data === 'expected_qr_code';
    }

    private function validateNFC($data)
    {
        return $data === 'expected_nfc_data';
    }

    private function validateFace($data)
    {
        return $data === 'expected_face_data';
    }

    private function validateFingerprint($data)
    {
        return $data === 'expected_fingerprint_data';
    }


}