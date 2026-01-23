<?php

namespace Database\Factories;

use App\Models\Feedback;
use App\Models\Staff;
use App\Models\Device;
use App\Models\Service;
use App\Models\Ticket;
use Illuminate\Database\Eloquent\Factories\Factory;

class FeedbackFactory extends Factory
{
    protected $model = Feedback::class;

    public function definition(): array
    {
        return [
            'staff_id' => Staff::factory(),
            'device_id' => Device::factory(),
            'service_id' => Service::factory(),
            'ticket_id' => Ticket::factory(),
            'value' => fake()->numberBetween(1, 5),
        ];
    }

    public function rating(int $rating): static
    {
        return $this->state(fn (array $attributes) => [
            'value' => $rating,
        ]);
    }
}
