<?php

namespace Tests\Unit\Events;

use App\Events\NumberSkipRequest;
use PHPUnit\Framework\TestCase;

class NumberSkipRequestTest extends TestCase
{
    /**
     * Test event holds skip number request data.
     * MQTT Topic: requestskipnumber
     * Payload: { "device_id": "B8:D6:1A:B9:DA:A4" }
     */
    public function test_event_holds_skip_number_request_data()
    {
        $data = ['device_id' => 'B8:D6:1A:B9:DA:A4'];
        
        $event = new NumberSkipRequest($data);
        
        $this->assertEquals($data, $event->data);
        $this->assertIsArray($event->data);
        $this->assertArrayHasKey('device_id', $event->data);
    }

    public function test_event_broadcast_channels()
    {
        $data = ['device_id' => 'B8:D6:1A:B9:DA:A4'];
        $event = new NumberSkipRequest($data);
        
        $channels = $event->broadcastOn();
        
        $this->assertIsArray($channels);
        $this->assertNotEmpty($channels);
    }

    public function test_event_handles_multiple_device_requests()
    {
        $devices = [
            'B8:D6:1A:B9:DA:A4',
            '10:20:BA:05:9B:9C',
            'AA:BB:CC:DD:EE:FF'
        ];
        
        foreach ($devices as $device) {
            $event = new NumberSkipRequest(['device_id' => $device]);
            $this->assertEquals($device, $event->data['device_id']);
        }
    }
}
