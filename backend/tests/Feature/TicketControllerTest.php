<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Ticket;
use App\Models\Service;
use App\Models\Device;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;

class TicketControllerTest extends TestCase
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

    public function test_create_ticket_for_service()
    {
        $service = Service::factory()->create();
        
        $response = $this->postJson('/api/ticket/' . $service->id);
        
        $response->assertStatus(200);
        $this->assertDatabaseHas('tickets', ['service_id' => $service->id]);
    }

    public function test_create_authenticated_ticket_for_service()
    {
        $service = Service::factory()->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/ticketAuth/' . $service->id, [
                'data' => [
                    'cccd' => '123456789012'
                ]
            ]);
        
        $response->assertStatus(200);
    }

    public function test_get_ticket_detail()
    {
        $ticket = Ticket::factory()->create();
        
        $response = $this->getJson('/api/ticket/detail/' . $ticket->id);
        
        $response->assertStatus(200);
    }

    public function test_validate_qr_code()
    {
        $ticket = Ticket::factory()->create();
        
        $response = $this->getJson('/api/ticket/validate-qr?qr_code=TEST-QR-123');
        
        $response->assertStatus(200);
    }

    public function test_generate_new_qr_code()
    {
        $ticket = Ticket::factory()->create();
        
        $response = $this->getJson('/api/ticket/generate-new-qr?ticket_id=' . $ticket->id);
        
        $response->assertStatus(200);
    }

    public function test_index_returns_tickets_list_with_filters()
    {
        $service = Service::factory()->create();
        Ticket::factory()->count(3)->create(['service_id' => $service->id]);
        Ticket::factory()->count(2)->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/ticket?service_id=' . $service->id);
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'ticket',
                'quickview'
            ]);
    }

    public function test_filter_tickets_by_device()
    {
        $device = Device::factory()->create();
        Ticket::factory()->count(3)->create(['device_id' => $device->id]);
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/ticket?device_id=' . $device->id);
        
        $response->assertStatus(200);
    }

    public function test_filter_tickets_by_status()
    {
        Ticket::factory()->count(3)->create(['status' => 'waiting']);
        Ticket::factory()->count(2)->create(['status' => 'called']);
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/ticket?status=waiting');
        
        $response->assertStatus(200);
    }

    public function test_export_tickets()
    {
        Ticket::factory()->count(5)->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/ticket/export');
        
        $response->assertStatus(200);
    }
}
