<?php

namespace App\Listeners;

use App\Events\ServiceTransfer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Carbon\Carbon;
use App\Models\Ticket;
use Spatie\Activitylog\Models\Activity;

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
    //can change this number to other service and allow to set if they in top or bot position
    public function handle(ServiceTransfer $event): void
    {
        try {
            $data = $event -> data;
            $startOfDay = Carbon::today()->startOfDay();
            $endOfDay = Carbon::today()->endOfDay();  

            $ticket = Ticket::where('ticket_number',$data['number'])
                ->whereBetween('created_at', [$startOfDay, $endOfDay])
                ->first();

            if ($data['position'] === 1) {
                $ticket->created_at = now()->startOfDay();  
                $ticket->service_id = $data['service_id'];
                $ticket->device_id = null;
                $ticket->status = "waiting";
                $ticket->save();
            } else {
                $ticket->created_at = now();  
                $ticket->service_id = $data['service_id'];
                $ticket->device_id = null;
                $ticket->status = "waiting";
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
                ->log('Failed to transfer service');
        }
    }
}
