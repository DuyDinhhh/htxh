<?php

namespace Tests\Unit\Events;

use App\Events\FeedbackReceived;
use PHPUnit\Framework\TestCase;

class FeedbackReceivedTest extends TestCase
{
    /**
     * Test event holds feedback data.
     * MQTT Topic: feedback
     * Payload: { "device_id": "B8:D6:1A:B9:DA:A4", "staff_id": 2, "value": 3, "number": "1028" }
     */
    public function test_event_holds_feedback_data()
    {
        $data = [
            'device_id' => 'B8:D6:1A:B9:DA:A4',
            'staff_id' => 2,
            'value' => 3,
            'number' => '1028'
        ];
        
        $event = new FeedbackReceived($data);
        
        $this->assertEquals($data, $event->data);
        $this->assertIsArray($event->data);
        $this->assertArrayHasKey('device_id', $event->data);
        $this->assertArrayHasKey('staff_id', $event->data);
        $this->assertArrayHasKey('value', $event->data);
        $this->assertArrayHasKey('number', $event->data);
    }

    public function test_event_accepts_all_rating_values()
    {
        for ($rating = 1; $rating <= 5; $rating++) {
            $data = [
                'device_id' => 'B8:D6:1A:B9:DA:A4',
                'staff_id' => 2,
                'value' => $rating,
                'number' => '1028'
            ];
            
            $event = new FeedbackReceived($data);
            $this->assertEquals($rating, $event->data['value']);
        }
    }

    public function test_event_holds_ticket_number()
    {
        $data = [
            'device_id' => 'B8:D6:1A:B9:DA:A4',
            'staff_id' => 2,
            'value' => 5,
            'number' => '1028'
        ];
        
        $event = new FeedbackReceived($data);
        $this->assertEquals('1028', $event->data['number']);
    }
}
