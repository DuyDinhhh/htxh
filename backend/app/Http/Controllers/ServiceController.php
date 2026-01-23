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
    //get list of services
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

    //get list of services include deleted or not, main goal is use for drop down filter
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
 
    // return list of service have assigned to a device, it show in kiosk get number
    public function activelist(){
        $service = Service::has('devices')->get();
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
    
    // show the service detail
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


    // create a service, allow input queue_number, it is the number before each service like 1 -> 1001,1002, 2 -> 2001, 2002
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

    //update the service detail
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

    //delete the service, each service deleted the system will resend the list of service to mqtt
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
