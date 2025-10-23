<?php

namespace App\Http\Controllers;
use App\Models\Device;
use Illuminate\Http\Request;
use App\Http\Requests\Device\StoreDeviceRequest;
use App\Http\Requests\Device\UpdateDeviceRequest;
use App\Models\ActivityLog;
class DeviceController extends Controller
{
    public function index(){
        $devices = Device::with('services')->paginate(8);
        return response()->json([
            'status'=>true,
            'message' => 'Device list retrieved successfully.',
            'devices'=> $devices
        ]);
    }

    public function list(){
        $devices = Device::with('services')->get();
        return response()->json([
            'status' => true,
            'message' => 'Device list retrieved successfully.',
            'devices' => $devices
        ]);
    }

    public function show($id){
        $device = Device::with('services')->findOrFail($id);
        if(!$device){
            return response()->json([
                'error' => 'Device not found.'
            ],404);
        }
        return response()->json([
            'status'=>true,
            'message'=>'Device retrieve successfully.',
            'device'=>$device
        ]);
    } 
     
    public function assignService(Request $request, $id)
    {
        $device = Device::findOrFail($id);
        if (!$device) {
            return response()->json([
                'error' => "Device not found"
            ], 404);
        }
        \Log::debug($request);
        // Detach previous services (optional: use sync for update)
        $syncData = [];
        foreach ($request->service_assignments as $assignment) {
            $syncData[$assignment['service_id']] = [
                'priority_number' => $assignment['priority_number'],
            ];
        }
        $device->name = $request -> name;
        $device->services()->sync($syncData);
        $device->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Service assigned successfully.',
        ]);
    }

    public function destroy($id){
        $device = Device::findOrFail($id);
        if(!$device){
            return response()->json([
                'error' => 'Device not found.'
            ],404);
        }
        // $this -> logActivity(
        //     auth()->id(),
        //     'Service',
        //     'Delete',
        //     [
        //         'service'=>$service->name,
        //         'changes'=>"Delete the service: ".$service->name
        //     ]
        // );

        $device -> delete();
        return response()->json([
            'status'=>true,
            'message'=> "Device deleted successfully."
        ]);
    }

    private function logActivity($userId, $actorType,$action, array $details)
    {
        ActivityLog::create([
            'actor_id' => $userId,
            'actor_type' => $actorType,
            'action' => $action,
            'context' => json_encode($details),
        ]);
    }
}
