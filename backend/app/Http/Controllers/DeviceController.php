<?php

namespace App\Http\Controllers;
use App\Models\Device;
use App\Models\Service;
use Illuminate\Http\Request;
use App\Http\Requests\Device\StoreDeviceRequest;
use App\Http\Requests\Device\UpdateDeviceRequest;
use PhpMqtt\Client\Facades\MQTT;

 class DeviceController extends Controller
{
    public function index(){
        $devices = Device::with('services')->paginate(8);

        $total = Device::count();
        $totalOnline = Device::where('status','online')->count();
        $totalOffline = Device::where('status','offline')->count();

        $quickview = [
            'total'=>$total,
            'totalOnline'=>$totalOnline,
            'totalOffline'=>$totalOffline
        ];
        return response()->json([
            'status'=>true,
            'message' => 'Device list retrieved successfully.',
            'devices'=> $devices,
            'quickview' =>$quickview
        ]);
    }

    public function list(){
        $devices = Device::withTrashed()
            ->with('services')
            ->get();
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
        $syncData = [];
        foreach ($request->service_assignments as $assignment) {
            $syncData[$assignment['service_id']] = [
                'priority_number' => $assignment['priority_number'],
            ];
        }
        $oldServices = $device->services()->pluck('service_id')->toArray();
        $device->name = $request->name;
        $device->services()->sync($syncData);
        $device->save();
        $newServices = $device->services()->pluck('service_id')->toArray();

        activity()
            ->useLog('device')                       
            ->performedOn($device)
            ->causedBy(auth()->user())
            ->event('updated')                        
            ->withProperties([
                'old_services' => $oldServices,
                'new_services' => $newServices,
                'assignments' => $syncData,
            ])
            ->log('Updated device-service assignments for device: '.$device->name);
        
        config(['mqtt-client.connections.default.client_id' => "publish-device-list"]);
        $devices = Device::select('id', 'name')->get();
        $services = Service::whereHas('devices')
                ->select('id', 'name')
                ->get();   
        $mqtt = MQTT::connection('publisher');
        $mqtt->publish("service/list", json_encode($services),0,true);
        $mqtt->publish("device/list", json_encode($devices),0,true);
        $mqtt->disconnect();

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

        $device -> delete();
        
        config(['mqtt-client.connections.default.client_id' => "publish-device-list"]);
        $devices = Device::select('id', 'name')->get();
        $mqtt = MQTT::connection('publisher');
        $mqtt->publish("device/list", json_encode($devices),0,true);
        $mqtt->disconnect();

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
