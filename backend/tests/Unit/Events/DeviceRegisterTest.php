<?php

namespace Tests\Unit\Events;

use App\Events\DeviceRegister;
use PHPUnit\Framework\TestCase;

class DeviceRegisterTest extends TestCase
{
    /**
     * Test event holds device registration data.
     * MQTT Topic: device/register
     * Payload: { "device_id": "B8:D6:1A:B9:DA:A4" }
     */
    public function test_event_holds_device_registration_data()
    {
        $data = ['device_id' => 'B8:D6:1A:B9:DA:A4'];
        
        $event = new DeviceRegister($data);
        
        $this->assertEquals($data, $event->data);
        $this->assertIsArray($event->data);
        $this->assertArrayHasKey('device_id', $event->data);
    }

    public function test_event_broadcast_channels()
    {
        $data = ['device_id' => 'B8:D6:1A:B9:DA:A4'];
        $event = new DeviceRegister($data);
        
        $channels = $event->broadcastOn();
        
        $this->assertIsArray($channels);
        $this->assertNotEmpty($channels);
    }

    public function test_event_handles_valid_mac_address_format()
    {
        $validMacAddresses = [
            'B8:D6:1A:B9:DA:A4',
            '10:20:BA:05:9B:9C',
            'AA:BB:CC:DD:EE:FF'
        ];
        
        foreach ($validMacAddresses as $mac) {
            $event = new DeviceRegister(['device_id' => $mac]);
            $this->assertEquals($mac, $event->data['device_id']);
        }
    }
}
