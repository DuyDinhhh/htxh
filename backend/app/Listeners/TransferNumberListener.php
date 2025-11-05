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
        \Log::debug("data transfer: ",$data);
        $today = Carbon::today()->format('Y-m-d'); 

        $ticket = Ticket::where('ticket_number',$data['number'])
                ->whereDate('created_at',$today)
                ->first();
        \Log::debug("Ticket transfer: ".$ticket);

        if($ticket){
            $ticket->status = "waiting";
            $ticket->device_id = $data['device_id'];
            $ticket->save();
        }
    }
}
