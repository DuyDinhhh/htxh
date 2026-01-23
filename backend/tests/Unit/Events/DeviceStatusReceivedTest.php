<?php

namespace Tests\Unit\Events;

use App\Events\DeviceStatusReceived;
use PHPUnit\Framework\TestCase;

class DeviceStatusReceivedTest extends TestCase
{
    /**
     * Test event holds device status data.
     * MQTT Topic: device/status
     * Payload: { "device_id": "B8:D6:1A:B9:DA:A4", "status": "online" }
     */
    public function test_event_holds_device_status_data()
    {
        $data = [
            'device_id' => 'B8:D6:1A:B9:DA:A4',
            'status' => 'online'
        ];
        
        $event = new DeviceStatusReceived($data);
        
        $this->assertEquals($data, $event->data);
        $this->assertIsArray($event->data);
        $this->assertArrayHasKey('device_id', $event->data);
        $this->assertArrayHasKey('status', $event->data);
    }

    public function test_event_accepts_online_status()
    {
        $data = ['device_id' => 'B8:D6:1A:B9:DA:A4', 'status' => 'online'];
        $event = new DeviceStatusReceived($data);
        
        $this->assertEquals('online', $event->data['status']);
    }

    public function test_event_accepts_offline_status()
    {
        $data = ['device_id' => 'B8:D6:1A:B9:DA:A4', 'status' => 'offline'];
        $event = new DeviceStatusReceived($data);
        
        $this->assertEquals('offline', $event->data['status']);
    }

    public function test_event_handles_various_device_ids()
    {
        $deviceIds = [
            'B8:D6:1A:B9:DA:A4',
            '10:20:BA:05:9B:9C',
            'AA:BB:CC:DD:EE:FF'
        ];
        
        foreach ($deviceIds as $deviceId) {
            $event = new DeviceStatusReceived(['device_id' => $deviceId, 'status' => 'online']);
            $this->assertEquals($deviceId, $event->data['device_id']);
        }
    }
}
