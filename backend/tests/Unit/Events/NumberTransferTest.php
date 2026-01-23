<?php

namespace Tests\Unit\Events;

use App\Events\NumberTransfer;
use PHPUnit\Framework\TestCase;

class NumberTransferTest extends TestCase
{
    /**
     * Test event holds number transfer data.
     * MQTT Topic: transfernumber
     * Payload: { "number": "1038", "device_id": "10:20:BA:01:48:A8" }
     */
    public function test_event_holds_number_transfer_data()
    {
        $data = [
            'number' => '1038',
            'device_id' => '10:20:BA:01:48:A8'
        ];
        
        $event = new NumberTransfer($data);
        
        $this->assertEquals($data, $event->data);
        $this->assertIsArray($event->data);
        $this->assertArrayHasKey('number', $event->data);
        $this->assertArrayHasKey('device_id', $event->data);
    }

    public function test_event_broadcast_channels()
    {
        $data = ['number' => '1038', 'device_id' => '10:20:BA:01:48:A8'];
        $event = new NumberTransfer($data);
        
        $channels = $event->broadcastOn();
        
        $this->assertIsArray($channels);
        $this->assertNotEmpty($channels);
    }

    public function test_event_transfers_to_another_counter()
    {
        $data = [
            'number' => '1038',
            'device_id' => '10:20:BA:01:48:A8'
        ];
        
        $event = new NumberTransfer($data);
        
        $this->assertEquals('1038', $event->data['number']);
        $this->assertEquals('10:20:BA:01:48:A8', $event->data['device_id']);
    }

    public function test_event_handles_multiple_transfers()
    {
        $transfers = [
            ['number' => '1038', 'device_id' => '10:20:BA:01:48:A8'],
            ['number' => '2040', 'device_id' => 'B8:D6:1A:B9:DA:A4'],
            ['number' => '1037', 'device_id' => 'AA:BB:CC:DD:EE:FF']
        ];
        
        foreach ($transfers as $transfer) {
            $event = new NumberTransfer($transfer);
            $this->assertEquals($transfer['number'], $event->data['number']);
            $this->assertEquals($transfer['device_id'], $event->data['device_id']);
        }
    }
}
