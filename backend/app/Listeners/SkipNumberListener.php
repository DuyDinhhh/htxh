<?php

namespace App\Listeners;

use App\Events\NumberSkip;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Carbon\Carbon;
use App\Models\Ticket;

class SkipNumberListener
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
    public function handle(NumberSkip $event): void
    {
        $data = $event -> data;
        $clientId = 'publish-' . $data['device_id'];
        config(['mqtt-client.connections.default.client_id' => $clientId]);
        $today = Carbon::today()->format('Y-m-d'); 

        Ticket::where('device_id', $data['device_id'])
        ->where('status', 'processing')
        ->whereDate('created_at', $today)
        ->update(['status' => 'skipped']);
        
        event(new \App\Events\NumberRequest($data));        
    }
}
