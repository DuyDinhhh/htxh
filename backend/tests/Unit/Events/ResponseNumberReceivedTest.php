<?php

namespace Tests\Unit\Events;

use App\Events\ResponseNumberReceived;
use PHPUnit\Framework\TestCase;

class ResponseNumberReceivedTest extends TestCase
{
    /**
     * Test event holds response number data.
     * MQTT Topic: responsenumber
     * Payload: { "device_id": "B8:D6:1A:B9:DA:A4", "number": "1111" }
     * Payload: { "device_id": "B8:D6:1A:B9:DA:A4", "number": "NoAvailable" }
     */
    public function test_event_holds_response_number_data()
    {
        $data = [
            'device_id' => 'B8:D6:1A:B9:DA:A4',
            'number' => '1111'
        ];
        
        $event = new ResponseNumberReceived($data);
        
        $this->assertEquals($data, $event->data);
        $this->assertIsArray($event->data);
    }

    public function test_event_returns_called_number()
    {
        $data = [
            'device_id' => 'B8:D6:1A:B9:DA:A4',
            'number' => '1111'
        ];
        
        $event = new ResponseNumberReceived($data);
        
        $this->assertEquals('1111', $event->data['number']);
    }

    public function test_event_returns_no_available_when_queue_empty()
    {
        $data = [
            'device_id' => 'B8:D6:1A:B9:DA:A4',
            'number' => 'NoAvailable'
        ];
        
        $event = new ResponseNumberReceived($data);
        
        $this->assertEquals('NoAvailable', $event->data['number']);
    }

    public function test_event_broadcasts_to_queue_display_channel()
    {
        $data = [
            'device_id' => 'B8:D6:1A:B9:DA:A4',
            'number' => '1111'
        ];
        
        $event = new ResponseNumberReceived($data);
        $channel = $event->broadcastOn();
        
        $this->assertNotNull($channel);
    }

    public function test_event_broadcast_as_returns_correct_name()
    {
        $data = ['device_id' => 'B8:D6:1A:B9:DA:A4', 'number' => '1111'];
        $event = new ResponseNumberReceived($data);
        
        $broadcastAs = $event->broadcastAs();
        
        $this->assertEquals('ResponseNumberReceived', $broadcastAs);
    }

    public function test_event_broadcast_with_includes_payload()
    {
        $data = [
            'device_id' => 'B8:D6:1A:B9:DA:A4',
            'number' => '1111'
        ];
        
        $event = new ResponseNumberReceived($data);
        $broadcastData = $event->broadcastWith();
        
        $this->assertIsArray($broadcastData);
        $this->assertArrayHasKey('payload', $broadcastData);
        $this->assertEquals($data, $broadcastData['payload']);
    }
}
