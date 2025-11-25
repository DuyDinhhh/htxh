<?php

namespace App\Listeners;

use App\Events\NumberSkip;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Carbon\Carbon;
use App\Models\Ticket;
// use Spatie\Activitylog\Models\Activity;

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
        $prefix = env('APP_ENV', "");
        $clientId = 'publish-' . $data['device_id'].$prefix ;
        config(['mqtt-client.connections.default.client_id' => $clientId]);
        $today = Carbon::today()->format('Y-m-d'); 
       
        $oldTicket = Ticket::where('device_id', $data['device_id'])
        ->where('status', 'processing')
        ->whereDate('created_at', $today)
        ->first();
        
        if($oldTicket){
            $oldTicket->device_id = null;            
            $oldTicket->status = "skipped";            
            $oldTicket->created_at = now();
            $oldTicket->save();
        }
        event(new \App\Events\NumberRequest($data));        
    }
}
