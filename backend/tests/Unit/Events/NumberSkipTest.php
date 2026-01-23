<?php

namespace Tests\Unit\Events;

use App\Events\NumberSkip;
use PHPUnit\Framework\TestCase;

class NumberSkipTest extends TestCase
{
    /**
     * Test event holds number skip data.
     * MQTT Topic: skipnumber
     * Payload: { "device_id": "B8:D6:1A:B9:DA:A4" }
     */
    public function test_event_holds_skip_number_data()
    {
        $data = ['device_id' => 'B8:D6:1A:B9:DA:A4'];
        
        $event = new NumberSkip($data);
        
        $this->assertEquals($data, $event->data);
        $this->assertIsArray($event->data);
        $this->assertArrayHasKey('device_id', $event->data);
    }

    public function test_event_broadcast_channels()
    {
        $data = ['device_id' => 'B8:D6:1A:B9:DA:A4'];
        $event = new NumberSkip($data);
        
        $channels = $event->broadcastOn();
        
        $this->assertIsArray($channels);
        $this->assertNotEmpty($channels);
    }

    public function test_event_handles_skip_request_from_different_devices()
    {
        $deviceIds = [
            'B8:D6:1A:B9:DA:A4',
            '10:20:BA:05:9B:9C'
        ];
        
        foreach ($deviceIds as $deviceId) {
            $event = new NumberSkip(['device_id' => $deviceId]);
            $this->assertEquals($deviceId, $event->data['device_id']);
        }
    }
}
