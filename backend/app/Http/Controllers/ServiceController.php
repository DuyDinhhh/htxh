<?php

namespace App\Http\Controllers;
use App\Models\Service;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

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
        $service = Service::with('devices')->get();
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


    public function store(Request $request){

        $service = new Service();
        $service -> name = $request ->name;
        $service -> color = $request -> color;
        $service -> queue_number = $request -> queue_number;
        $service -> created_by = auth()->id();

        $service -> save();

        // $this -> logActivity(
        //     auth()->id(),
        //     'Service',
        //     'Create',
        //     [
        //         'service' => $service->name,
        //         'changes' => "Create new service: ".$service->name,
        //     ]
        // );

        return response()->json([
            'status'=>true,
            'message'=> "Service created successfully.",
            'service'=>$service
        ]);
    }

    public function update(Request $request,$id){
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
        $service -> updated_by = auth()->id();

        $service -> save();
        // $changes = ActivityLog::logChanges($oldValues,$service->getAttributes());

        // $this->logActivity(
        //     auth()->id(),
        //     'Service',
        //     'Update',
        //     [
        //         'service'=> $service->name,
        //         'changes'=>$changes
        //     ]
        // );

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
        // $this -> logActivity(
        //     auth()->id(),
        //     'Service',
        //     'Delete',
        //     [
        //         'service'=>$service->name,
        //         'changes'=>"Delete the service: ".$service->name
        //     ]
        // );

        $service -> delete();
        return response()->json([
            'status'=>true,
            'message'=> "Sevice deleted successfully."
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
