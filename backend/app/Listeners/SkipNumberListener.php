<?php

namespace App\Listeners;

use App\Events\NumberSkip;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Carbon\Carbon;
use App\Models\Ticket;
use Spatie\Activitylog\Models\Activity;

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
        try {
            $data = $event -> data;
            
            $startOfDay = Carbon::today()->startOfDay();
            $endOfDay = Carbon::today()->endOfDay();   
        
            $oldTicket = Ticket::where('device_id', $data['device_id'])
                ->where('status', 'processing')
                ->whereBetween('created_at', [$startOfDay, $endOfDay])
                ->first();
            
            if($oldTicket){
                $oldTicket->status = "skipped";            
                $oldTicket->created_at = now();
                $oldTicket->save();
            }
            event(new \App\Events\NumberRequest($data)); 
        } catch (\Throwable $e) {
            activity()
                ->useLog('mqtt')
                ->event('error')
                ->withProperties([
                    'error' => $e->getMessage(),
                    'data'  => $data,
                ])
                ->log('Failed to skip number');
        }       
    }
}
