<?php

namespace Tests\Unit\Events;

use App\Events\NumberRequest;
use PHPUnit\Framework\TestCase;

class NumberRequestTest extends TestCase
{
    /**
     * Test event holds number request data.
     * MQTT Topic: requestnumber
     * Payload: { "device_id": "B8:D6:1A:B9:DA:A4" }
     */
    public function test_event_holds_number_request_data()
    {
        $data = ['device_id' => 'B8:D6:1A:B9:DA:A4'];
        
        $event = new NumberRequest($data);
        
        $this->assertEquals($data, $event->data);
        $this->assertIsArray($event->data);
        $this->assertArrayHasKey('device_id', $event->data);
    }

    public function test_event_broadcast_channels()
    {
        $data = ['device_id' => 'B8:D6:1A:B9:DA:A4'];
        $event = new NumberRequest($data);
        
        $channels = $event->broadcastOn();
        
        $this->assertIsArray($channels);
        $this->assertNotEmpty($channels);
    }

    public function test_event_handles_various_device_mac_addresses()
    {
        $macAddresses = [
            'B8:D6:1A:B9:DA:A4',
            '10:20:BA:05:9B:9C',
            'AA:BB:CC:DD:EE:FF'
        ];
        
        foreach ($macAddresses as $mac) {
            $event = new NumberRequest(['device_id' => $mac]);
            $this->assertEquals($mac, $event->data['device_id']);
        }
    }
}
