<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow; // 👈 use NOW for immediate send
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ResponseNumberReceived implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public array $data) {}

    public function broadcastOn(): Channel
    {
        return new Channel('queue.display'); // public channel
    }

    public function broadcastAs(): string
    {
        return 'ResponseNumberReceived';
    }

    public function broadcastWith(): array
    {
        \Log::info('Broadcasting event with data: ', $this->data);
        return ['payload' => $this->data];
    }
}
