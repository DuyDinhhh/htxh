<?php

namespace App\Http\Controllers;
use App\Models\Staff;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use App\Http\Requests\Staff\StoreStaffRequest;
use App\Http\Requests\Staff\UpdateStaffRequest;

class StaffController extends Controller
{
    // get list of staff
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
    
    // get list of staff include deleted staff, main goal is for filter dropdown data
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

    // get staff detail
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

    //create new staff
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

    //update staff data
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
    // delete staff
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
