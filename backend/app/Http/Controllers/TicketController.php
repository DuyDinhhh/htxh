<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Service;
use App\Models\Device;
use App\Models\Ticket;
use Carbon\Carbon;

class TicketController extends Controller
{
    public function index(Request $request){
        $ticket = Ticket::query()
        ->when($request->filled('service_id'), function ($q) use ($request){
            $q -> where('service_id',$request->service_id);
        })
        ->when($request->filled('device_id'), function($q) use ($request){
            $q -> where('device_id', $request -> device_id);
        })
        ->when($request->filled('date_from'), function($q) use ($request) {
            $q -> where('created_at', '>=', Carbon::parse($request->date_from));
        })
        ->when($request->filled('date_to'), function($q) use ($request) {
            $q -> where('created_at','<=', \Carbon\Carbon::parse($request->date_to)->endOfDay());
        })
        ->when($request->filled('sort'), function($q) use ($request) {
            $q -> orderBy('created_at', $request->sort === 'oldest' ? 'asc' : 'desc');
        }, function ($q){
            $q -> orderBy('created_at','desc');
        })
        ->with('device','service')
        ->paginate(8);

         return response()->json([
            'status'=>true,
            'message'=>'Ticket list retrieved successfully,',
            'ticket'=>$ticket
        ]);
    }

    public function store($id){
        $service = Service::with('devices')->findOrFail($id);
        \Log::debug("Service: ". $service);
        \Log::debug("Device: ". $service->devices);
 
        $today = Carbon::today()->format('Y-m-d');
        $deviceStats=[];
        foreach($service->devices as $device){
            $ticketwaiting = Ticket::where("device_id",$device->id)
                            ->where("status","waiting")
                            ->whereDate('created_at', $today)
                            ->count();
            $deviceStats[] = [
                'device' => $device,
                'waiting' => $ticketwaiting,
            ];
        }

        \Log::debug("Device status: ",$deviceStats);

          usort($deviceStats, function ($a, $b) {
            if ($a['waiting'] !== $b['waiting']) {
                return $a['waiting'] <=> $b['waiting'];
            }
            return strcmp((string) $a['device']->id, (string) $b['device']->id);
        });

        \Log::debug("Device status: ",$deviceStats);

        $targetDevice   = $deviceStats[0]['device'];
        $targetDeviceId = (string) $targetDevice->id;
         $today = Carbon::today()->format('Y-m-d');
        $latestTicket = Ticket::where('service_id', $service->id)
            ->whereDate('created_at', $today)
            ->orderBy('ticket_number', 'desc')  // Order by ticket number descending
            ->first();
        if (!$latestTicket) {
            $ticketSequence = 1;
        } else {
            $lastSequence = (int) substr($latestTicket->ticket_number, -3);
            $ticketSequence = $lastSequence + 1;
        }
        $formattedSequence = str_pad($ticketSequence, 3, '0', STR_PAD_LEFT);
        $ticketNumber = "{$service->queue_number}{$formattedSequence}";

        \Log::debug('Ticket number: '.$ticketNumber);

        try {
            $ticket = new Ticket();
            $ticket->device_id = $targetDeviceId;
            $ticket->ticket_number = $ticketNumber;
            $ticket->service_id = $service->id;
            $ticket->save();

            return response()->json([
                'status'=>true,
                'message'=>"Lấy số thành công: ". $ticketNumber,
                'ticket'=>$ticket
            ]);
        }
        catch(\Throwable $e){
            return response()->json([
                'status'=>false,
                'message'=> $e->getMessage(),
            ]);
            \Log::error('Failed to store ticket', ['error' => $e->getMessage(), 'data' => $data]);
        }
    }

    public function queue_display()
    {
        $ticket = Ticket::with('service','device')
                ->where('status','!=','waiting')
                ->orderBy('updated_at','desc')
                ->limit(8)
                ->get();

        return response()->json([
            'status'=>true,
            'tickets'=>$ticket,
            'message'=>'Ticket retrieved successfully.'
        ]);
    }




    public function export(Request $request)
    {
        $tickets = Ticket::query()
        ->when($request->filled('service_id'), function ($q) use ($request){
            $q -> where('service_id',$request->service_id);
        })
        ->when($request->filled('device_id'), function($q) use ($request){
            $q -> where('device_id', $request -> device_id);
        })
        ->when($request->filled('date_from'), function($q) use ($request) {
            $q -> where('created_at', '>=', Carbon::parse($request->date_from));
        })
        ->when($request->filled('date_to'), function($q) use ($request) {
            $q -> where('created_at','<=', \Carbon\Carbon::parse($request->date_to)->endOfDay());
        })
        ->when($request->filled('sort'), function($q) use ($request) {
            $q -> orderBy('created_at', $request->sort === 'oldest' ? 'asc' : 'desc');
        }, function ($q){
            $q -> orderBy('created_at','desc');
        })
        ->with('device','service')
        ->get();

        $ticket_array = [
            [
                'Số thứ tự',
                'Thiết bị',
                'Dịch vụ',
                'Trạng thái',
                'Ngày tạo'
            ]
        ];

        foreach ($tickets as $ticket) {
            $ticket_array[] = [
                $ticket -> ticket_number,
                optional($ticket->device)->name ?? $ticket->service_id,
                optional($ticket->service)->name ?? $ticket->service_id,  
                $ticket->status === "called" ? "Đã gọi" : "Đang chờ",
                $ticket->created_at->format('Y-m-d H:i:s'),
            ];
        }
        return $this->downloadExcel($ticket_array, 'ticket.xls');
    }

    protected function downloadExcel(array $data, string $filename = 'export.xls')
    {
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '4000M');

        try {
            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->getDefaultColumnDimension()->setWidth(20);
            $sheet->fromArray($data);

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xls($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
            }, $filename, [
                'Content-Type' => 'application/vnd.ms-excel',
                'Cache-Control' => 'max-age=0',
        ]);
        } catch (\Exception $e) {
            \Log::error($e);
            return response()->json(['error' => 'Failed to export Excel.'], 500);
        }
    }
}
