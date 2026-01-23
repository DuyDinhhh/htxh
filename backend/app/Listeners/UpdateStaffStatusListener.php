<?php

namespace App\Listeners;

use App\Events\StaffStatusReceived;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Models\Staff;
use Spatie\Activitylog\Models\Activity;
class UpdateStaffStatusListener
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

    // listen to mqtt and auto update the status of the feedback screen
    public function handle(StaffStatusReceived $event): void
    {
        try {
            $data = is_array($event->data) ? $event->data : json_decode($event->data, true);
            
            if (!isset($data['status'])) {
                throw new \InvalidArgumentException('Status is required');
            }

            $status = $data['status'];
            $deviceId = $data['device_id'] ?? null;
            $staffId = $data['staff_id'] ?? null;

            if ($status === 'offline') {
                $staff = Staff::where('device_id', $deviceId)->first();
            } else {
                $staff = Staff::find($staffId);
            }

            if (!$staff) {
                // $this->logError('Staff not found, skipped status update', [
                //     'staff_id' => $staffId,
                //     'device_id' => $deviceId,
                //     'status' => $status
                // ]);
                return;
            }

            if ($status === 'offline') {
                $staff->update([
                    'status' => 'offline',
                    'device_id' => null
                ]);
            } else {
                $staff->update([
                    'status' => $status,
                    'device_id' => $deviceId
                ]);
            }
        } catch (\Throwable $e) {
            $this->logError('Failed to update staff status', [
                'error' => $e->getMessage(),
                'data' => $data ?? [],
            ]);
        }
    }

    private function logError(string $message, array $properties): void
    {
        activity()
            ->useLog('mqtt')
            ->event('error')
            ->withProperties($properties)
            ->log($message);
    }
}
