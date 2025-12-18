<?php

namespace App\Listeners;

use App\Events\NumberSkipRequest;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Carbon\Carbon;
use App\Models\Ticket;
use PhpMqtt\Client\Facades\MQTT;
use Spatie\Activitylog\Models\Activity;

class ResponseSkipNumber
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(NumberSkipRequest $event): void
    {
        $data = $event -> data;
        $prefix = env('APP_ENV', "");
        $clientId = 'publish-' . $data['device_id'].$prefix ;
        config(['mqtt-client.connections.default.client_id' => $clientId]);
        
        $startOfDay = Carbon::today()->startOfDay();
        $endOfDay = Carbon::today()->endOfDay();  
        
        //danh dau da goi
        $oldTicket = Ticket::where('device_id', $data['device_id'])
            ->where('status', 'processing')
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->first();
        
        if($oldTicket){
            $oldTicket->status = "called";
            $oldTicket->save();
        }

        //goi so skipped tu thiet bi do
        $ticket = Ticket::where('device_id',$data['device_id'])
                ->where('status','skipped')
                ->whereBetween('created_at', [$startOfDay, $endOfDay])
                ->first();

        if ($ticket) {
            $message = [
                "device_id" => $data['device_id'],
                "number" => $ticket->ticket_number,
                "service_name" => ($ticket->service->name ?? null),
                "device_name"=>optional($ticket->device)->name,
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
            $ticket->status = "processing";
            $ticket->touch(); 
        } else {
            $message = [
                "device_id" => $data['device_id'],
                "number" => "NoAvailable",
            ];
            $mqtt = MQTT::connection('publisher');
            $mqtt->publish("responsenumber", json_encode($message));
            $this->logMqttEvent('response', 'responsenumber', json_encode($message));

            // $mqtt->publish("response-recall-number", json_encode($message));
            $mqtt->disconnect();
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
