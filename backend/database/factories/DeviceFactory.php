<?php

namespace Database\Factories;

use App\Models\Device;
use Illuminate\Database\Eloquent\Factories\Factory;

class DeviceFactory extends Factory
{
    protected $model = Device::class;

    public function definition(): array
    {
        return [
            'id' => fake()->unique()->macAddress(),
            'name' => 'Device ' . fake()->numberBetween(1, 100),
            'status' => fake()->randomElement(['online', 'offline']),
        ];
    }

    public function online(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'online',
        ]);
    }

    public function offline(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'offline',
        ]);
    }
}
