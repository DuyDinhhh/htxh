<?php

namespace App\Http\Controllers;
use App\Models\Service;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use App\Http\Requests\Service\UpdateServiceRequest;
use App\Http\Requests\Service\StoreServiceRequest;
use PhpMqtt\Client\Facades\MQTT;

class ServiceController extends Controller
{
    public function index(){
        $service = Service::with('devices')->paginate(8);
        if(!$service){
            return response()->json([
                'error' => 'Services not found.'
            ],404);
        }

        return response()->json([
            'status'=>true,
            'message'=>"Service list retrieve successfully.",
            'services'=>$service
        ]);
    }

    public function list(){
        $service = Service::withTrashed()
        ->with('devices')->get();
        if(!$service){
            return response()->json([
                'error' => 'Services not found.'
            ],404);
        }

        return response()->json([
            'status'=>true,
            'message'=>"Service list retrieve successfully.",
            'services'=>$service
        ]);
    }

    public function show($id){
        $service = Service::findOrFail($id);

        if(!$service){
            return response()->json([
                'error' => 'Service not found.'
            ],404);
        }
        return response()->json([
            'status'=>true,
            'message'=>'Service retrieve successfully.',
            'service'=>$service
        ]);
    }


    public function store(StoreServiceRequest $request){
        
        $service = new Service();
        $service -> name = $request ->name;
        $service -> color = $request -> color;
        $service -> queue_number = $request -> queue_number;
        // $service -> created_by = auth()->id();
        $service -> save();
        return response()->json([
            'status'=>true,
            'message'=> "Service created successfully.",
            'service'=>$service
        ]);
    }

    public function update(UpdateServiceRequest $request,$id)
    {
        $service = Service::findOrFail($id);
        $oldValues = $service->getOriginal();
        if(!$service){
            return response() ->json([
                'status'=> false,
                'message' => "Service not found"
            ]);
        }

        $service -> name = $request -> name;
        $service -> color = $request -> color;
        $service -> queue_number = $request -> queue_number;
        // $service -> updated_by = auth()->id();

        $service -> save();
        return response()->json([
            'status'=>true,
            'message'=> "Service updated successfully.",
            'service'=>$service
        ]);
    }

    public function destroy($id){
        $service = Service::findOrFail($id);
        if(!$service){
            return response()->json([
                'status' => false,
                'service' => $service
            ]);
        }
        $service -> delete();

        config(['mqtt-client.connections.default.client_id' => 'publish-service-list']);
        $services = Service::whereHas('devices')
            ->select('id', 'name')
            ->get();            
        $mqtt = MQTT::connection('publisher');
        $mqtt->publish("service/list", json_encode($services),0,true);
        $mqtt->disconnect();

        return response()->json([
            'status'=>true,
            'message'=> "Sevice deleted successfully."
        ]);
    }
 
}
