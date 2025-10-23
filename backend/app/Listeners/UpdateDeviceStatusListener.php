<?php

namespace App\Listeners;

use App\Events\DeviceStatusReceived;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Models\Device;
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

        \Log::debug('test a', ['data' => $data]);

        try {
            \Log::debug('test b');

            if (!isset($data['device_id'], $data['status'])) {
                throw new \InvalidArgumentException('device_id and status are required');
            }

            // Persist (match on device_id, not id)
            $device = Device::updateOrCreate(
                ['id' => $data['device_id']],
                ['status' => $data['status']]
            );

            \Log::debug('device saved', [
                'id'                 => $device->id,
                'device_id'          => $device->device_id,
                'status'             => $device->status,
                'wasRecentlyCreated' => $device->wasRecentlyCreated,
            ]);
        } catch (\Throwable $e) {
            \Log::error('Failed to update device status', [
                'error' => $e->getMessage(),
                'data'  => $data ?? null,
            ]);
            // optional: report($e);
        }
    }

}
