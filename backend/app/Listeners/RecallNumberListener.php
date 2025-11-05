<?php

namespace App\Listeners;

use App\Events\NumberRecall;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Carbon\Carbon;
use App\Models\Ticket;
use App\Models\Service;

use PhpMqtt\Client\Facades\MQTT;
class RecallNumberListener
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
    public function handle(NumberRecall $event): void
    {
        $data = $event -> data;
        $clientId = 'publish-' . $data['device_id'];
        config(['mqtt-client.connections.default.client_id' => $clientId]);
        $today = Carbon::today()->format('Y-m-d'); 

        $ticket = Ticket::where('device_id',$data['device_id'])
                ->where('status','processing')
                ->whereDate('created_at',$today)
                ->first();

        if ($ticket) {
            $message = [
                "device_id" => $data['device_id'],
                "number" => $ticket->ticket_number,
                "device_name"=>optional($ticket->device)->name

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
