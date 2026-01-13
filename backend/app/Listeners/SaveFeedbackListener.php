<?php

namespace App\Listeners;

use App\Events\FeedbackReceived;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Models\Feedback;
use App\Models\Device;
use App\Models\Ticket;
use Carbon\Carbon;
use Spatie\Activitylog\Models\Activity;

class SaveFeedbackListener
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
 
    public function handle(FeedbackReceived $event): void
    {
        $data = $event->data;
        try {
            $device = Device::with('services')->find($data['device_id']);
            if (!$device) {
                throw new \Exception("Device not found by MAC: " . $data['device_id']);
            }

            $startOfDay = Carbon::today()->startOfDay();
            $endOfDay = Carbon::today()->endOfDay();   

            $ticket = Ticket::where('ticket_number',$data['number'])
                    ->whereBetween('created_at', [$startOfDay, $endOfDay])
                    ->first();
            $ticketId = $ticket->id;
            $deviceId = $ticket->device_id;
            $serviceId = $ticket->service_id;

            $feedback = new Feedback();
            $feedback->device_id   = $deviceId;
            $feedback->ticket_id = $ticketId;
            $feedback->service_id = $serviceId;
            // $feedback->user_id     = $data['user_id'] ?? 1;
            $feedback->value       = $data['value'] ?? 0;
            $feedback->save();
        } catch (\Throwable $e) {
            \Log::error('Failed to store feedback', ['error' => $e->getMessage(), 'data' => $data]);
            activity()
                ->useLog('mqtt')
                ->event('error')
                ->withProperties([
                    'error' => $e->getMessage(),
                    'data'  => $data,
                ])
                ->log('Failed to store feedback');
        }
    }
}
