<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Service;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;

class ServiceControllerTest extends TestCase
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

    public function test_index_returns_services_list()
    {
        Service::factory()->count(3)->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/service');
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'services'
            ]);
    }

    public function test_list_returns_all_services_including_deleted()
    {
        Service::factory()->count(2)->create();
        $deletedService = Service::factory()->create();
        $deletedService->delete();
        
        $response = $this->getJson('/api/service/list');
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'services'
            ]);
    }

    public function test_active_list_returns_only_active_services()
    {
        Service::factory()->count(3)->create();
        Service::factory()->count(2)->create();
        
        $response = $this->getJson('/api/service/activelist');
        
        $response->assertStatus(200);
    }

    public function test_show_returns_service_detail()
    {
        $service = Service::factory()->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/service/' . $service->id);
        
        $response->assertStatus(200);
    }

    public function test_store_creates_new_service()
    {
        $serviceData = [
            'name' => 'Test Service',
            'queue_number' => 100,
            'color' => '#FF5733'
        ];
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/service', $serviceData);
        
        $response->assertStatus(201);
        $this->assertDatabaseHas('services', ['name' => 'Test Service']);
    }

    public function test_update_modifies_existing_service()
    {
        $service = Service::factory()->create();
        
        $updateData = [
            'name' => 'Updated Service Name',
            'queue_number' => 200
        ];
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->putJson('/api/service/' . $service->id, $updateData);
        
        $response->assertStatus(200);
    }

    public function test_destroy_deletes_service()
    {
        $service = Service::factory()->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->deleteJson('/api/service/' . $service->id);
        
        $response->assertStatus(200);
        $this->assertSoftDeleted('services', ['id' => $service->id]);
    }
}
