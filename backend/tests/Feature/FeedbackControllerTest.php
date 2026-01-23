<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Feedback;
use App\Models\Service;
use App\Models\Device;
use App\Models\Staff;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;

class FeedbackControllerTest extends TestCase
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

    public function test_index_returns_feedback_list()
    {
        Feedback::factory()->count(5)->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/feedback');
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'feedback'
            ]);
    }

    public function test_filter_feedback_by_service()
    {
        $service = Service::factory()->create();
        Feedback::factory()->count(3)->create(['service_id' => $service->id]);
        Feedback::factory()->count(2)->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/feedback?service_id=' . $service->id);
        
        $response->assertStatus(200);
    }

    public function test_filter_feedback_by_device()
    {
        $device = Device::factory()->create();
        Feedback::factory()->count(3)->create(['device_id' => $device->id]);
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/feedback?device_id=' . $device->id);
        
        $response->assertStatus(200);
    }

    public function test_filter_feedback_by_staff()
    {
        $staff = Staff::factory()->create();
        Feedback::factory()->count(3)->create(['staff_id' => $staff->id]);
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/feedback?staff_id=' . $staff->id);
        
        $response->assertStatus(200);
    }

    public function test_filter_feedback_by_rating_value()
    {
        Feedback::factory()->count(3)->create(['value' => 5]);
        Feedback::factory()->count(2)->create(['value' => 3]);
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/feedback?value=5');
        
        $response->assertStatus(200);
    }

    public function test_export_feedback()
    {
        Feedback::factory()->count(5)->create();
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/feedback/export');
        
        $response->assertStatus(200);
    }

    public function test_monthly_stats_returns_aggregated_data()
    {
        Feedback::factory()->count(10)->create();
        
        $month = now()->format('Y-m');
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/feedback/monthly-stats?month=' . $month);
        
        $response->assertStatus(200);
    }

    public function test_filter_feedback_by_date_range()
    {
        Feedback::factory()->count(3)->create([
            'created_at' => now()->subDays(5)
        ]);
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token
        ])->getJson('/api/feedback?date_from=' . now()->subDays(7)->toDateString() . '&date_to=' . now()->toDateString());
        
        $response->assertStatus(200);
    }
}
