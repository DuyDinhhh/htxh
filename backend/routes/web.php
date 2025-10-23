<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MqttDemoController;
Route::get('/mqtt/publish', [MqttDemoController::class, 'publish']);

Route::get('/mqtt/debug', function () {
    return [
        'host' => '['.config('mqtt.host').']',
        'port' => config('mqtt.port'),
        'user' => '['.config('mqtt.username').']',
        'pass_len' => strlen((string) config('mqtt.password')), // don't print the pass
        'tls'  => config('mqtt.tls'),
    ];
});
Route::get('/', function () {
    return view('welcome');
});
