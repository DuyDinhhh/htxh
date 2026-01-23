<?php

namespace Tests\Unit\Events;

use App\Events\ServiceTransfer;
use PHPUnit\Framework\TestCase;

class ServiceTransferTest extends TestCase
{
    /**
     * Test event holds service transfer data.
     * MQTT Topic: transferservice
     * Payload: { "number": "2040", "service_id": "12", "position": 0 }
     * Payload: { "number": "1037", "service_id": "12", "position": 1 }
     */
    public function test_event_holds_service_transfer_data()
    {
        $data = [
            'number' => '2040',
            'service_id' => '12',
            'position' => 0
        ];
        
        $event = new ServiceTransfer($data);
        
        $this->assertEquals($data, $event->data);
        $this->assertIsArray($event->data);
        $this->assertArrayHasKey('number', $event->data);
        $this->assertArrayHasKey('service_id', $event->data);
        $this->assertArrayHasKey('position', $event->data);
    }

    public function test_event_broadcast_channels()
    {
        $data = ['number' => '2040', 'service_id' => '12', 'position' => 0];
        $event = new ServiceTransfer($data);
        
        $channels = $event->broadcastOn();
        
        $this->assertIsArray($channels);
        $this->assertNotEmpty($channels);
    }

    public function test_event_transfer_to_bottom_of_queue()
    {
        $data = [
            'number' => '2040',
            'service_id' => '12',
            'position' => 0  // 0 = bottom
        ];
        
        $event = new ServiceTransfer($data);
        
        $this->assertEquals(0, $event->data['position']);
    }

    public function test_event_transfer_to_top_of_queue()
    {
        $data = [
            'number' => '1037',
            'service_id' => '12',
            'position' => 1  // 1 = top
        ];
        
        $event = new ServiceTransfer($data);
        
        $this->assertEquals(1, $event->data['position']);
    }

    public function test_event_handles_multiple_service_transfers()
    {
        $transfers = [
            ['number' => '2040', 'service_id' => '12', 'position' => 0],
            ['number' => '1037', 'service_id' => '12', 'position' => 1],
            ['number' => '3050', 'service_id' => '15', 'position' => 0]
        ];
        
        foreach ($transfers as $transfer) {
            $event = new ServiceTransfer($transfer);
            $this->assertEquals($transfer['number'], $event->data['number']);
            $this->assertEquals($transfer['service_id'], $event->data['service_id']);
            $this->assertEquals($transfer['position'], $event->data['position']);
        }
    }
}
