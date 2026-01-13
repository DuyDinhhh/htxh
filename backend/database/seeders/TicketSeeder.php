<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use App\Models\Ticket;

class TicketSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();
        $startId = 1;   

        for ($i = 0; $i < 1200000; $i++) {
            $ticket_number = $faker->randomElement([
                $faker->numberBetween(1000, 1999), 
                $faker->numberBetween(2000, 2999), 
                $faker->numberBetween(3000, 3999), 
                $faker->numberBetween(4000, 4999)
            ]);

            
            $ticket = Ticket::create([
                'ticket_number' => $ticket_number,   
                'sequence' => $ticket_number,   
                'device_id' => $i % 2 === 0 
                    ? $faker->randomElement(['94:E6:86:09:A4:78', 'A8:42:E3:4C:7C:BC', 'R1:42:E3:4C:7C:BC', 'R2:42:E3:4C:7C:BC'])
                    : NULL,
                'service_id' => $faker->randomElement([1, 2, 3, 5]), 
                'status' => $faker->randomElement(['waiting', 'called', 'processing', 'skipped']),
                'created_at' => $faker->dateTimeThisDecade->format('Y-m-d H:i:s'),
                'updated_at' => $faker->randomElement([NULL, $faker->dateTimeThisDecade->format('Y-m-d H:i:s')]), 
            ]);
        }
    }
}
