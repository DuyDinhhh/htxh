<?php

namespace App\Listeners;

use App\Events\DeviceRegister;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Models\Device;
class SaveDeviceListener
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
    public function handle(DeviceRegister $event): void
    {
        $data = $event -> data;
        // try{
        //     $device = new Device();

        //     $device -> name = $data['name'] ?? 'no name';
        //     $device -> mac = $data['mac'] ?? 'no mac';

        //     $device -> save();
        // }
        try {
            Device::updateOrCreate(
                ['mac' => $data['mac'] ?? 'no mac'], // Find by MAC
                [
                    'name' => $data['name'] ?? 'no name',
                ]
            );
        }
        catch(\Throwable $e){
            \Log::error('Failed to store device', ['error' => $e->getMessage(), 'data' => $data]);
        }
    }
}
