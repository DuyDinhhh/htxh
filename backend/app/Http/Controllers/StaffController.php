<?php

namespace App\Http\Controllers;
use App\Models\Staff;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use App\Http\Requests\Staff\StoreStaffRequest;
use App\Http\Requests\Staff\UpdateStaffRequest;

class StaffController extends Controller
{
    public function index(){
        $staff = Staff::paginate(8);
        if(!$staff){
            return response() ->json([
                'status' => false,
                'message' => "Staff not found"
            ]);
        }
        return response() ->json([
            'status' => true,
            'message' => "List staff retrieved successfully",
            'staff' => $staff
        ]);
    }

    public function list(){
        $staff = Staff::withTrashed()->get();
        if(!$staff){
            return response() ->json([
                'status' => false,
                'message' => "Staff not found"
            ]);
        }
        return response() ->json([
            'status' => true,
            'message' => "List staff retrieved successfully",
            'staff' => $staff
        ]);
    }

    public function show($id){
        $staff = Staff::findOrFail($id);
        if(!$staff){
            return response() -> json([
                'status' => false,
                'message' => "Staff not found"
            ]);
        }
        return response() ->json([
            'status' => true,
            'message' => "Staff retrieved successfully",
            'staff' => $staff
        ]);
    }

    public function store(StoreStaffRequest $request){
        try {
            $staff = new Staff();
            $staff -> name = $request -> name;
            $staff -> username = $request -> username;
            $staff -> password = $request -> password;

            $staff -> save();
            return response()->json([
                'status' => true,
                'message' => "Staff created successfully",
                'staff' => $staff
            ]);
        } catch (\Throwable $e) {
            activity()
                ->useLog('staff')
                ->event('error')
                ->withProperties([
                    'error' => $e->getMessage(),
                 ])
            ->log('Failed to create staff');
        }
    }

    public function update(UpdateStaffRequest $request,$id){
        try {
            $staff = Staff::findOrFail($id);
            if (!$staff){
                return response()->json([
                    'status' => false,
                    'message' => "Staff not found."
                ]);
            }
            $staff -> name = $request -> name;
            $staff -> username = $request -> username;
            if ($request->filled('password')) {
                        $staff->password = $request->password;
                    }
        
            $staff -> save();
            return response() -> json([
                'status' => true,
                'message' => "Staff updated successfully",
                'staff' => $staff
            ]);
        } catch (\Throwable $e) {
            activity()
                ->useLog('staff')
                ->event('error')
                ->withProperties([
                    'error' => $e->getMessage(),
                 ])
            ->log('Failed to update staff');

            return response()->json([
                'status' => false,
                'message' => "Failed to update staff: " . $e->getMessage()
            ], 500);
        }
    }

    public function delete($id){
        try {
            $staff = Staff::findOrFail($id);
            if(!$staff){
                return response() -> json([
                    'status' => false,
                    'message' => "Staff not found"
                ]);
            }
            $staff -> delete();
            return response()->json([
                'status' => true,
                'message' => "Staff deleted successfully"
            ]);
        } catch (\Throwable $e) {
            activity()
                ->useLog('staff')
                ->event('error')
                ->withProperties([
                    'error' => $e->getMessage(),
                 ])
            ->log('Failed to delete staff');
        }

    }
}
