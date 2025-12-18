<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpMqtt\Client\Facades\MQTT;
use Spatie\Activitylog\Models\Activity;
use App\Models\Device;
use App\Models\Service;
use Carbon\Carbon;

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
        $currentTime = Carbon::now()->toDateTimeString();
        $prefix = env('APP_ENV', "");
        $clientId = $prefix. 'subscribe-' . $topic. $currentTime ;

        config(['mqtt-client.connections.default.client_id' => $clientId]);
        if($topic === 'requestnumber'){
            $devices = Device::select('id', 'name')->get();
            $services = Service::whereHas('devices')
                ->select('id', 'name')
                ->get();            
            $mqtt = MQTT::connection('publisher');
            $mqtt->publish("device/list", json_encode($devices),0,true);
            $mqtt->publish("service/list", json_encode($services),0,true);
            $mqtt->disconnect();
        }

        $mqtt = MQTT::connection();
        if($topic !== "#"){
            $this->info("Subscribing to topic: {$topic}");
            $this->logMqttEvent('connect', $topic, 'Subscribe to the topic: '.$topic);
        }
        
        $mqtt->subscribe($topic, function (string $topic, string $message) {
            $this->info(sprintf("Received message on topic [%s]: %s", $topic, $message));
            $data = json_decode($message, true);
            if($topic !== "response"){
                $this->logMqttEvent('receive', $topic, $data);}
            if($topic === 'feedback'){
                event(new \App\Events\FeedbackReceived($data));
            }elseif ($topic === 'device/status'){
                event(new \App\Events\DeviceStatusReceived($data)); 
            }elseif ($topic === 'requestnumber'){
                event(new \App\Events\NumberRequest($data));
            }elseif ($topic === 'requestskipnumber'){
                event(new \App\Events\NumberSkipRequest($data));
            }elseif ($topic === 'recallnumber'){
                event(new \App\Events\NumberRecall($data));
            }elseif ($topic === 'skipnumber'){
                event(new \App\Events\NumberSkip($data));
            }elseif ($topic === 'specificnumber'){
                event(new \App\Events\NumberSpecific($data));
            }elseif ($topic === 'transfernumber'){
                event(new \App\Events\NumberTransfer($data));
            }elseif ($topic === 'device/register'){
                event(new \App\Events\DeviceRegister($data));
            }elseif ($topic === 'transferservice'){
                event(new \App\Events\ServiceTransfer($data));
            } else {
            }
        });
        $mqtt->loop(true);
    }

    private function logMqttEvent($event, $topic, $message)
    {
        activity()
            ->useLog('mqtt')  
            ->event($event)   
            ->withProperties([
                'message' => $message,  
            ])
            ->log($topic);
    }

}

