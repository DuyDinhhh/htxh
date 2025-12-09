<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Config;

class ConfigsTableSeeder extends Seeder
{
    public function run(): void
    {
        Config::create([
            'text_top' => 'Ngân hàng Agribank - Chi nhánh ',
            'text_bottom' => 'Kính chào quý khách, chúc quý khách một ngày tốt lành!',
            'bg_top_color' => '#B3AAAA',
            'bg_bottom_color' => '#B3AAAA',
            'bg_middle_color' => '#B3AAAA',
            'table_header_color' => '#f3f4f6',
            'table_row_odd_color' => '#ffffff',
            'table_row_even_color' => '#fff2f4',
            'table_text_color' => '#000000',
            'table_text_active_color' => '#ff0000',
            'text_top_color' => '#b10730',
            'text_bottom_color' => '#b10730',
            'photo' => 'images/agribank-logo.png',
        ]);
    }
}
