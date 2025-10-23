<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpMqtt\Client\Facades\MQTT;

class MqttSubscribe extends Command
{
    protected $signature = 'mqtt:subscribe {topic}';
    protected $description = 'Subscribe to a given MQTT topic and display messages in the terminal';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $topic = $this->argument('topic');
        $clientId = 'subscribe-' . $topic;

        config(['mqtt-client.connections.default.client_id' => $clientId]);
        $mqtt = MQTT::connection();
        $this->info("Subscribing to topic: {$topic}");

        $mqtt->subscribe($topic, function (string $topic, string $message) {
            \Log::info("MQTT callback start", ['topic' => $topic, 'message' => $message]);
            $this->info(sprintf("Received message on topic [%s]: %s", $topic, $message));
            $data = json_decode($message, true);

            // $parts = explode('/', $topic);
            if($topic === 'feedback'){
                event(new \App\Events\FeedbackReceived($data)); //{"device_id":"00:1A:2B:3C:4D:09","value":3}
            }elseif ($topic === 'device/register') {
                event(new \App\Events\DeviceRegister($data));
            }elseif ($topic === 'device/status'){
                event(new \App\Events\DeviceStatusReceived($data)); 
            }elseif ($topic === 'requestnumber'){
                event(new \App\Events\NumberRequest($data));
            }elseif ($topic === 'recallnumber'){
                event(new \App\Events\NumberRecall($data));
            }elseif ($topic === 'skipnumber'){
                event(new \App\Events\NumberSkip($data));
            }elseif ($topic === 'specificnumber'){
                event(new \App\Events\NumberSpecific($data));
            }elseif ($topic === 'responsenumber'){
                if ($data['number']!== "NoAvailable" ){
                    event(new \App\Events\ResponseNumberReceived($data));
                }
            }else {
                \Log::debug('default subscribe');
            }
        });
        $mqtt->loop(true);
    }
}
