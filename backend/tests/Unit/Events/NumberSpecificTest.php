<?php

namespace Tests\Unit\Events;

use App\Events\NumberSpecific;
use PHPUnit\Framework\TestCase;

class NumberSpecificTest extends TestCase
{
    /**
     * Test event holds specific number request data.
     * MQTT Topic: specificnumber
     * Payload: { "device_id": "B8:D6:1A:B9:DA:A4", "number": "1038" }
     */
    public function test_event_holds_specific_number_data()
    {
        $data = [
            'device_id' => 'B8:D6:1A:B9:DA:A4',
            'number' => '1038'
        ];
        
        $event = new NumberSpecific($data);
        
        $this->assertEquals($data, $event->data);
        $this->assertIsArray($event->data);
        $this->assertArrayHasKey('device_id', $event->data);
        $this->assertArrayHasKey('number', $event->data);
    }

    public function test_event_broadcast_channels()
    {
        $data = ['device_id' => 'B8:D6:1A:B9:DA:A4', 'number' => '1038'];
        $event = new NumberSpecific($data);
        
        $channels = $event->broadcastOn();
        
        $this->assertIsArray($channels);
        $this->assertNotEmpty($channels);
    }

    public function test_event_handles_various_ticket_numbers()
    {
        $ticketNumbers = ['1038', '2040', '1037', '9999'];
        
        foreach ($ticketNumbers as $number) {
            $event = new NumberSpecific([
                'device_id' => 'B8:D6:1A:B9:DA:A4',
                'number' => $number
            ]);
            $this->assertEquals($number, $event->data['number']);
        }
    }

    public function test_event_priority_number_from_counter_keyboard()
    {
        $data = [
            'device_id' => 'B8:D6:1A:B9:DA:A4',
            'number' => '1038'
        ];
        
        $event = new NumberSpecific($data);
        
        $this->assertEquals('1038', $event->data['number']);
        $this->assertEquals('B8:D6:1A:B9:DA:A4', $event->data['device_id']);
    }
}
