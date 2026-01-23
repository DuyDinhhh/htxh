<?php

namespace Database\Factories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        return [
            'name' => 'Service ' . fake()->word(),
            'queue_number' => fake()->numberBetween(1000, 9999),
            'color' => fake()->hexColor(),
        ];
    }
}
