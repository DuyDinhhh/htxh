<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Staff;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;

class StaffControllerTest extends TestCase
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

    public function test_index_returns_staff_list()
    {
        Staff::factory()->count(5)->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/staff');
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'staff'
            ]);
    }

    public function test_list_returns_all_staff_including_deleted()
    {
        Staff::factory()->count(3)->create();
        $deletedStaff = Staff::factory()->create();
        $deletedStaff->delete();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/staff/list');
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'staff'
            ]);
    }

    public function test_show_returns_staff_detail()
    {
        $staff = Staff::factory()->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/staff/' . $staff->id);
        
        $response->assertStatus(200);
    }

    public function test_store_creates_new_staff()
    {
        $staffData = [
            'name' => 'John Doe',
            'username' => 'johndoe',
            'password' => 'password123',
            'staff_code' => 'STF001',
            'position' => 'Manager'
        ];
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->postJson('/api/staff', $staffData);
        
        $response->assertStatus(201);
        $this->assertDatabaseHas('staff', ['name' => 'John Doe']);
    }

    public function test_update_modifies_existing_staff()
    {
        $staff = Staff::factory()->create();
        
        $updateData = [
            'name' => 'Updated Name',
            'username' => $staff->username,
            'position' => 'Senior Manager'
        ];
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->putJson('/api/staff/' . $staff->id, $updateData);
        
        $response->assertStatus(200);
    }

    public function test_destroy_soft_deletes_staff()
    {
        $staff = Staff::factory()->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->deleteJson('/api/staff/' . $staff->id);
        
        $response->assertStatus(200);
        $this->assertSoftDeleted('staff', ['id' => $staff->id]);
    }

    public function test_unauthenticated_user_cannot_access_staff_endpoints()
    {
        $response = $this->getJson('/api/staff');
        $response->assertStatus(401);
    }
}
