<?php

namespace App\Listeners;

use App\Events\NumberSpecific;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Carbon\Carbon;
use App\Models\Ticket;
use PhpMqtt\Client\Facades\MQTT;
use Spatie\Activitylog\Models\Activity;
use App\Models\Device;

class SpecificNumberListener
{

    public function __construct()
    {
        //
    }
 
    public function handle(NumberSpecific $event): void
    {
        try {
            $data = $event -> data;
            $deviceId = $data['device_id'] ?? null;
            $number = $data['number'] ?? null;
            $prefix = env('APP_ENV', "");
            $clientId = 'publish-' . $data['device_id'].$prefix ;
            config(['mqtt-client.connections.default.client_id' => $clientId]);
            
            $startOfDay = Carbon::today()->startOfDay();
            $endOfDay = Carbon::today()->endOfDay();   

            $device = Device::where('id',$data['device_id'])
                    ->first();

            //danh dau da goi
            $oldTicket = Ticket::where('device_id', $data['device_id'])
            ->where('status', 'processing')
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->first();
            
            if($oldTicket){
                $oldTicket->status = "called";
                $oldTicket->save();
            }

            $ticket = Ticket::where('ticket_number', $number)
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->first();

            if ($ticket) {
                $message = [
                    "device_id" => $data['device_id'],
                    "number" => $ticket->ticket_number,
                    "service_name" => ($ticket->service->name ?? null),
                    "device_name"=>$device->name
                ];
                $mqtt = MQTT::connection('publisher');
                $mqtt->publish("responsenumber", json_encode($message));
                activity()
                    ->useLog('mqtt')  
                    ->event('response')   
                    ->withProperties([
                        'message' => $message,  
                    ])
                    ->log('responsenumber');
                $mqtt->disconnect();
                $this->logMqttEvent('response', 'responsenumber', json_encode($message));
                $ticket->device_id = $data['device_id'];
                $ticket->status = "processing";
                $ticket->save();
            } else {
                $message = [
                    "device_id" => $data['device_id'],
                    "number" => "NoAvailable"
                ];
                
                $mqtt = MQTT::connection('publisher');
                $mqtt->publish("responsenumber", json_encode($message));
                $this->logMqttEvent('response', 'responsenumber', json_encode($message));

                $mqtt->disconnect();
            }
        } catch (\Throwable $e) {
            activity()
                ->useLog('mqtt')
                ->event('error')
                ->withProperties([
                    'error' => $e->getMessage(),
                    'data'  => $data,
                ])
                ->log('Failed to response specific number');
        }
    }

    private function logMqttEvent($event, $topic, $message)
    {
        activity()
            ->useLog('mqtt')  
            ->event($event)   
            ->withProperties([
                'message' => $message,  
            ])
            ->log($topic);
    }
}
