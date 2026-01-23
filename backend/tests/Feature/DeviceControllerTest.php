<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Device;
use App\Models\Service;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;

class DeviceControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->token = JWTAuth::fromUser($this->user);
    }

    public function test_index_returns_devices_list()
    {
        Device::factory()->count(3)->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/device');
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'devices',
                'quickview' => [
                    'total',
                    'totalOnline',
                    'totalOffline'
                ]
            ]);
    }

    public function test_list_returns_all_devices_including_deleted()
    {
        Device::factory()->count(2)->create();
        $deletedDevice = Device::factory()->create();
        $deletedDevice->delete();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/device/list');
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'devices'
            ]);
    }

    public function test_show_returns_device_detail()
    {
        $device = Device::factory()->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/device/' . $device->id);
        
        $response->assertStatus(200);
    }

    public function test_assign_service_to_device()
    {
        $device = Device::factory()->create();
        $service = Service::factory()->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->putJson('/api/device/' . $device->id . '/assignService', [
                'name' => $device->name,
                'service_assignments' => [
                    [
                        'service_id' => $service->id,
                        'priority_number' => 1
                    ]
                ]
            ]);
        
        $response->assertStatus(200);
    }

    public function test_destroy_deletes_device()
    {
        $device = Device::factory()->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->deleteJson('/api/device/' . $device->id);
        
        $response->assertStatus(200);
        $this->assertSoftDeleted('devices', ['id' => $device->id]);
    }

    public function test_unauthenticated_user_cannot_access_device_endpoints()
    {
        $response = $this->getJson('/api/device');
        $response->assertStatus(401);
    }
}
