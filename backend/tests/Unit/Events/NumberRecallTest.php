<?php

namespace Tests\Unit\Events;

use App\Events\NumberRecall;
use PHPUnit\Framework\TestCase;

class NumberRecallTest extends TestCase
{
    /**
     * Test event holds number recall data.
     * MQTT Topic: recallnumber
     * Payload: { "device_id": "B8:D6:1A:B9:DA:A4" }
     */
    public function test_event_holds_recall_number_data()
    {
        $data = ['device_id' => 'B8:D6:1A:B9:DA:A4'];
        
        $event = new NumberRecall($data);
        
        $this->assertEquals($data, $event->data);
        $this->assertIsArray($event->data);
        $this->assertArrayHasKey('device_id', $event->data);
    }

    public function test_event_broadcast_channels()
    {
        $data = ['device_id' => 'B8:D6:1A:B9:DA:A4'];
        $event = new NumberRecall($data);
        
        $channels = $event->broadcastOn();
        
        $this->assertIsArray($channels);
        $this->assertNotEmpty($channels);
    }

    public function test_event_handles_different_device_ids()
    {
        $deviceIds = [
            'B8:D6:1A:B9:DA:A4',
            '10:20:BA:05:9B:9C',
            'AA:BB:CC:DD:EE:FF'
        ];
        
        foreach ($deviceIds as $deviceId) {
            $event = new NumberRecall(['device_id' => $deviceId]);
            $this->assertEquals($deviceId, $event->data['device_id']);
        }
    }
}
