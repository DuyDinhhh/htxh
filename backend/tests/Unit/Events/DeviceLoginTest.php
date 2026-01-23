<?php

namespace Tests\Unit\Events;

use App\Events\DeviceLogin;
use PHPUnit\Framework\TestCase;

class DeviceLoginTest extends TestCase
{
    /**
     * Test event holds device login data.
     * MQTT Topic: devicelogin
     * Payload: { "device_id": "10:20:BA:05:9B:9C", "username": "tao", "password": "1111" }
     */
    public function test_event_holds_device_login_data()
    {
        $data = [
            'device_id' => '10:20:BA:05:9B:9C',
            'username' => 'tao',
            'password' => '1111'
        ];
        
        $event = new DeviceLogin($data);
        
        $this->assertEquals($data, $event->data);
        $this->assertIsArray($event->data);
        $this->assertArrayHasKey('device_id', $event->data);
        $this->assertArrayHasKey('username', $event->data);
    }

    public function test_event_broadcast_channels()
    {
        $data = ['device_id' => '10:20:BA:05:9B:9C', 'username' => 'test'];
        $event = new DeviceLogin($data);
        
        $channels = $event->broadcastOn();
        
        $this->assertIsArray($channels);
        $this->assertNotEmpty($channels);
    }
}
