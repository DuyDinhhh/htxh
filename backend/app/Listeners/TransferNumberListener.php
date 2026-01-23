<?php

namespace App\Listeners;

use App\Events\NumberTransfer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Models\Ticket;
use Carbon\Carbon;
use Spatie\Activitylog\Models\Activity;

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

    //transfer number to a specific counter, and at the top position
    public function handle(NumberTransfer $event): void
    {
        try {
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
        } catch (\Throwable $e) {
            activity()
                ->useLog('mqtt')
                ->event('error')
                ->withProperties([
                    'error' => $e->getMessage(),
                    'data'  => $data,
                ])
                ->log('Failed to transfer number');
        }
    }
}
