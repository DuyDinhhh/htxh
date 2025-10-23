<?php

namespace App\Services;

use PhpMqtt\Client\MqttClient;
use PhpMqtt\Client\ConnectionSettings;

class MqttService
{
    public static function makeClient(?string $clientId = null): MqttClient
    {
        $host = trim((string) config('mqtt.host'));
        $port = (int) config('mqtt.port', 1883);
        $clientId = $clientId ?? (config('mqtt.client_id') ?: 'laravel-'.bin2hex(random_bytes(3)));

        // Force MQTT 3.1.1, plain TCP
        return new MqttClient($host, $port, $clientId, MqttClient::MQTT_3_1_1);
    }

    public static function settings(): ConnectionSettings
    {
        return (new ConnectionSettings)
            ->setUsername(trim((string) config('mqtt.username')))
            ->setPassword(trim((string) config('mqtt.password')))
            ->setUseTls((bool) config('mqtt.tls', false))
            ->setKeepAliveInterval(60)
            ->setConnectTimeout(5)
            ->setReconnectAutomatically(true)
            ->setMaxReconnectAttempts(0)
            ->setDelayBetweenReconnectAttempts(2000);
    }
}
