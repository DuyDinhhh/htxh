<?php

namespace Tests\Unit\Events;

use App\Events\StaffStatusReceived;
use PHPUnit\Framework\TestCase;

class StaffStatusReceivedTest extends TestCase
{
    /**
     * Test event holds staff status data.
     * MQTT Topic: staff/status
     * Payload: { "status": "offline", "device_id": "10:20:BA:05:9B:9C" }
     * Payload: { "staff_id": 2, "status": "online", "device_id": "10:20:BA:05:9B:9C" }
     */
    public function test_event_holds_staff_status_data()
    {
        $data = [
            'staff_id' => 2,
            'status' => 'online',
            'device_id' => '10:20:BA:05:9B:9C'
        ];
        
        $event = new StaffStatusReceived($data);
        
        $this->assertEquals($data, $event->data);
        $this->assertIsArray($event->data);
        $this->assertArrayHasKey('status', $event->data);
        $this->assertArrayHasKey('device_id', $event->data);
    }

    public function test_event_broadcast_channels()
    {
        $data = ['status' => 'online', 'device_id' => '10:20:BA:05:9B:9C'];
        $event = new StaffStatusReceived($data);
        
        $channels = $event->broadcastOn();
        
        $this->assertIsArray($channels);
        $this->assertNotEmpty($channels);
    }

    public function test_event_staff_online_status()
    {
        $data = [
            'staff_id' => 2,
            'status' => 'online',
            'device_id' => '10:20:BA:05:9B:9C'
        ];
        
        $event = new StaffStatusReceived($data);
        
        $this->assertEquals('online', $event->data['status']);
        $this->assertEquals(2, $event->data['staff_id']);
    }

    public function test_event_staff_offline_status()
    {
        $data = [
            'status' => 'offline',
            'device_id' => '10:20:BA:05:9B:9C'
        ];
        
        $event = new StaffStatusReceived($data);
        
        $this->assertEquals('offline', $event->data['status']);
    }

    public function test_event_handles_various_staff_statuses()
    {
        $statuses = ['online', 'offline', 'available', 'busy', 'break'];
        
        foreach ($statuses as $status) {
            $data = [
                'staff_id' => 2,
                'status' => $status,
                'device_id' => '10:20:BA:05:9B:9C'
            ];
            
            $event = new StaffStatusReceived($data);
            $this->assertEquals($status, $event->data['status']);
        }
    }

    public function test_event_for_feedback_screen_availability()
    {
        $data = [
            'staff_id' => 2,
            'status' => 'online',
            'device_id' => '10:20:BA:05:9B:9C'
        ];
        
        $event = new StaffStatusReceived($data);
        
        $this->assertEquals('online', $event->data['status']);
        $this->assertEquals('10:20:BA:05:9B:9C', $event->data['device_id']);
    }
}
