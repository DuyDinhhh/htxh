<?php

namespace App\Listeners;

use App\Events\NumberSpecific;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Carbon\Carbon;
use App\Models\Ticket;
use PhpMqtt\Client\Facades\MQTT;
class SpecificNumberListener
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
    public function handle(NumberSpecific $event): void
    {
        $data = $event -> data;
        $deviceId = $data['device_id'] ?? null;
        $number = $data['number'] ?? null;
        $clientId = 'publish-' . $data['device_id'];
        config(['mqtt-client.connections.default.client_id' => $clientId]);
        $today = Carbon::today()->format('Y-m-d'); 

        Ticket::where('device_id', $data['device_id'])
        ->where('status', 'processing')
        ->whereDate('created_at', $today)
        ->update(['status' => 'called']);

        $ticket = Ticket::where('device_id', $deviceId)
        ->where('ticket_number', $number)
        ->whereDate('created_at', $today)
        ->first();

        if ($ticket) {
            $message = [
                "device_id" => $data['device_id'],
                "number" => $ticket->ticket_number,
                "device_name"=>optional($ticket->device)->name

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
