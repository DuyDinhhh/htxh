<?php

namespace Database\Factories;

use App\Models\Ticket;
use App\Models\Device;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

class TicketFactory extends Factory
{
    protected $model = Ticket::class;

    public function definition(): array
    {
        return [
            'ticket_number' => fake()->unique()->numberBetween(1000, 9999),
            'sequence' => fake()->numberBetween(1, 999),
            'device_id' => Device::factory(),
            'service_id' => Service::factory(),
            'status' => fake()->randomElement(['waiting', 'called', 'skipped', 'processing']),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }
}
