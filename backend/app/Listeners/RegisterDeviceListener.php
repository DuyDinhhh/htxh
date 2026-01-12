<?php

namespace App\Listeners;

use App\Events\DeviceRegister;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Models\Device;
use PhpMqtt\Client\Facades\MQTT;
use Spatie\Activitylog\Models\Activity;

class RegisterDeviceListener
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    public function handle(DeviceRegister $event): void
    {
        $data = $event -> data;
        try {
            $device = Device::withTrashed()->updateOrCreate(
                ['id' => $data['device_id'] ?? 'no mac'],
            );

            if (method_exists($device, 'trashed') && $device->trashed()) {
                $device->name = "";
                $device->restore();
            }

            config(['mqtt-client.connections.default.client_id' => "publish-device-list"]);
            $devices = Device::select('id', 'name')->get();
            $mqtt = MQTT::connection('publisher');
            $mqtt->publish("device/list", json_encode($devices),0, true);
            $mqtt->disconnect();
        }
        catch(\Throwable $e){
            \Log::error('Failed to store device', ['error' => $e->getMessage(), 'data' => $data]);
            activity()
                ->useLog('mqtt')
                ->event('error')
                ->withProperties([
                    'error' => $e->getMessage(),
                    'data'  => $data,
                ])
                ->log('Failed to register device');
        }
    }
}
