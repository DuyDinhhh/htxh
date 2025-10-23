<?php

namespace App\Http\Controllers;
use App\Models\DeviceConfig;
use App\Models\Device;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use App\Http\Requests\Device\StoreDeviceConfigRequest;

class DeviceConfigController extends Controller
{
    public function config($id){
        $config = DeviceConfig::where('device_id',$id)
        ->where('active',true)
        ->latest()
        ->first();

        if(!$config){
            return response()->json([
                'status'=>'error',
                'message' => 'No active config found for device' 
            ],404);
        }

        return response() ->json([
            'status'=>'success',
            'config'=>$config
        ]);
    }

    public function store(Request $request,$id){

        $device = Device::findOrFail($id);

        if(!$device){
            return response()->json([
                'status'=> false,
                'message'=> "Device not found."
            ]);
        }

        $config = new DeviceConfig();
        $config -> device_id = $request -> device_id;
        $config -> config = json_encode($request->config);
        $config -> active = $request -> active;
        $config -> created_by = auth()->id();

        $config -> save();
        $this->logActivity(
            auth()->id(),
            'DeviceConfig',
            'Create',
            [
                'device'=>$config->device_id,
                'changes' => "Create new device config: " . $config->device_id,
            ]
        );

        return response()->json([
            'status' => 'true',
            'message' => 'Config created successfully',
            'config' => $config
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
