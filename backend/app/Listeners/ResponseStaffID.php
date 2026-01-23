<?php

namespace App\Listeners;

use App\Events\DeviceLogin;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Models\Staff;
use PhpMqtt\Client\Facades\MQTT;
use Carbon\Carbon;

class ResponseStaffID
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

    //response staff ID for the feedback screen
    public function handle(DeviceLogin $event): void
    {
        $data = $event->data;
         try {
            $mqtt = MQTT::connection('publisher');
            $message = [
                'status' => "false",
                'message' => "Incorrect username or password",
            ];
            $topic = $data['device_id'] . '/staff_id';
            $staff = Staff::where('username', $data['username'])->first();
            if (!$staff) {
                 activity()
                    ->useLog('devicelogin')
                    ->event('error')
                    ->withProperties([
                        'error' => 'Username not found',
                        'username' => $data['username'],
                        'device_id' => $data['device_id'],
                    ])
                    ->log('Device login failed:  username not found.');
                $mqtt->publish($topic, json_encode($message));
                $mqtt->disconnect();
                return;
            }
            // Verify password
            if (($data['password'] == $staff->password)) {
                $message = [
                  'status' => "true",
                  'message' => $staff->id,
                ];
                $staff -> status = "online";
                $staff -> device_id = $data['device_id'];
                $staff -> save();
            } 
            $mqtt->publish($topic, json_encode($message));
            activity()
                ->useLog('mqtt')  
                ->event('response')   
                ->withProperties([
                    'message' => $message,  
                ])
                ->log('devicelogin');
            $mqtt->disconnect();
        } catch (\Throwable $e) {
            activity()
                ->useLog('mqtt')
                ->event('error')
                ->withProperties([
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'data'  => $data ??  [],
                ])
                ->log('Failed to process device login.');
        }
    }
}
