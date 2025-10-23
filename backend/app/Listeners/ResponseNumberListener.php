<?php

namespace App\Listeners;

use App\Events\NumberRequest;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Carbon\Carbon;
use App\Models\Ticket;
use App\Models\Device;
use PhpMqtt\Client\Facades\MQTT;
class ResponseNumberListener
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

     
    public function handle(NumberRequest $event): void
    {
        $data = $event -> data;
        $clientId = 'publish-' . $data['device_id'];
        config(['mqtt-client.connections.default.client_id' => $clientId]);
        $today = Carbon::today()->format('Y-m-d'); 

        Ticket::where('device_id', $data['device_id'])
        ->where('status', 'processing')
        ->whereDate('created_at', $today)
        ->update(['status' => 'called']);
        
        $device = Device::with(['services' => function ($q) {
            $q->withPivot('priority_number')
            ->orderByPivot('priority_number', 'asc');
        }])
        ->where('id', $data['device_id'])
        ->first();


        $priorities = $device->services
        ->pluck('pivot.priority_number')
        ->unique()
        ->sort()
        ->values();

        $ticket = null;
        $serviceName = null;
       
        foreach ($priorities as $priority) {
            $candidateTickets = [];
            foreach ($device->services as $service) {
                if ($service->pivot->priority_number == $priority) {
                    $ticketFound = Ticket::where('device_id', $data['device_id'])
                        ->where('service_id', $service->id)
                        ->where('status', 'waiting')
                        ->orderBy('created_at', 'asc')
                        ->whereDate('created_at', $today)
                        ->first();
                    if ($ticketFound) {
                        $candidateTickets[] = [
                            'ticket' => $ticketFound,
                            'serviceName' => $service->name
                        ];
                    }
                }
            }
                if (!empty($candidateTickets)) {
                usort($candidateTickets, function($a, $b) {
                    return strtotime($a['ticket']->created_at) <=> strtotime($b['ticket']->created_at);
                });
                $ticket = $candidateTickets[0]['ticket'];
                $serviceName = $candidateTickets[0]['serviceName'];
                break;  
            }
        }

        if(!$ticket){
            foreach ($priorities as $priority) {
                $candidateTickets = [];
                foreach ($device->services as $service) {
                    if ($service->pivot->priority_number == $priority) {
                        $ticketFound = Ticket::where('device_id', $data['device_id'])
                            ->where('service_id', $service->id)
                            ->where('status', 'skipped')
                            ->orderBy('created_at', 'asc')
                            ->whereDate('created_at', $today)
                            ->first();
                        if ($ticketFound) {
                            $candidateTickets[] = [
                                'ticket' => $ticketFound,
                                'serviceName' => $service->name
                            ];
                        }
                    }
                }
                if (!empty($candidateTickets)) {
                    usort($candidateTickets, function($a, $b) {
                        return strtotime($a['ticket']->created_at) <=> strtotime($b['ticket']->created_at);
                    });
                    $ticket = $candidateTickets[0]['ticket'];
                    $serviceName = $candidateTickets[0]['serviceName'];
                    break;  
                }
            }
        }


        if ($ticket) {
            $message = [
                "device_id" => $data['device_id'],
                "number" => $ticket->ticket_number,
                "service_name" => $serviceName,
                "device_name" => $device -> name
            ];
            $mqtt = MQTT::connection('publisher');
            $mqtt->publish("responsenumber", json_encode($message));
            $mqtt->disconnect();

            $ticket->status = "processing";
            $ticket->save();
        } else {
            $message = [
                "device_id" => $data['device_id'],
                "number" => "NoAvailable"
            ];
            $mqtt = MQTT::connection('publisher');
            $mqtt->publish("responsenumber", json_encode($message));
            $mqtt->disconnect();
        }
    }
}
