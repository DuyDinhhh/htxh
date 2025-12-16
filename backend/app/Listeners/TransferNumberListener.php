<?php

namespace App\Listeners;

use App\Events\NumberTransfer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Models\Ticket;
use Carbon\Carbon;
class TransferNumberListener
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
    public function handle(NumberTransfer $event): void
    {
        $data = $event -> data;
        
        $startOfDay = Carbon::today()->startOfDay();    
        $endOfDay = Carbon::today()->endOfDay();  
        
        $ticket = Ticket::where('ticket_number',$data['number'])
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->first();

        if($ticket){
            $ticket->status = "waiting";
            $ticket->device_id = $data['device_id'];
            $ticket->save();
        }
    }
}
