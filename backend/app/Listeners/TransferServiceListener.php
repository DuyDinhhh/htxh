<?php

namespace App\Listeners;

use App\Events\ServiceTransfer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Carbon\Carbon;
use App\Models\Ticket;
class TransferServiceListener
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
    public function handle(ServiceTransfer $event): void
    {
        \Log::debug("Test 123"); 
        $data = $event -> data;
        $today = Carbon::today()->format('Y-m-d'); 
        $ticket = Ticket::where('ticket_number',$data['number'])
                        ->whereDate('created_at',$today)
                        ->first();
        \Log::debug("Test ticket: ".$ticket); 

        if ($data['position'] === 1) {
            \Log::debug("Position 1: ".$ticket); 
            $ticket->created_at = now()->startOfDay();  
            $ticket->service_id = $data['service_id'];
            $ticket->device_id = null;
            $ticket->status = "waiting";
            $ticket->save();
        } else {
            \Log::debug("Position 0: ".$ticket); 
            $ticket->created_at = now();  
            $ticket->service_id = $data['service_id'];
            $ticket->device_id = null;
            $ticket->status = "waiting";
            $ticket->save();
        }
    }
}
