<?php

namespace App\Listeners;

use App\Events\DeviceStatusReceived;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Models\Device;
use Spatie\Activitylog\Models\Activity;

class UpdateDeviceStatusListener
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
    public function handle(DeviceStatusReceived $event): void
    {
        $data = is_array($event->data) ? $event->data : json_decode($event->data, true);
        try {
     
            if (!isset($data['device_id'], $data['status'])) {
                throw new \InvalidArgumentException('device_id and status are required');
            }
            $device = Device::updateOrCreate(
                ['id' => $data['device_id']],
                ['status' => $data['status']]
            );
         } catch (\Throwable $e) {
            activity()
                ->useLog('mqtt')
                ->event('error')
                ->withProperties([
                    'error' => $e->getMessage(),
                    'data'  => $data,
                ])
                ->log('Failed to update device status');
        }
    }

}
