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
        $today = Carbon::today()->format('Y-m-d'); 

        $ticket = Ticket::query()
        ->when($request->filled('service_id'), function ($q) use ($request){
            $q -> where('service_id',$request->service_id);
        })
        ->when($request->filled('device_id'), function($q) use ($request){
            $q -> where('device_id', $request -> device_id);
        })
        ->when($request->filled('status'), function($q) use ($request){
            $q -> where('status', $request -> status);
        })
        ->when($request->filled('date_from'), function($q) use ($request) {
            $q -> where('created_at', '>=', Carbon::parse($request->date_from));
        })
        ->when($request->filled('date_to'), function($q) use ($request) {
            $q -> where('created_at','<=', \Carbon\Carbon::parse($request->date_to)->endOfDay());
        })
        ->when($request->filled('sort'), function($q) use ($request) {
            $q -> orderBy('id', $request->sort === 'oldest' ? 'asc' : 'desc');
        }, function ($q){
            $q -> orderBy('id','desc');
        })
        ->with('deviceWithTrashed','serviceWithTrashed')
        ->paginate(8);

        $total = Ticket::count();
        $totaltoday = Ticket::whereDate('created_at',$today)->count();

        $waiting = Ticket::where('status','waiting')->count();
        $waitingtoday = Ticket::where('status','waiting')->whereDate('created_at',$today)->count();

        $called = Ticket::where('status','called')->count();
        $calledtoday = Ticket::where('status','called')->whereDate('created_at',$today)->count();

        $skipped = Ticket::where('status','skipped')->count();
        $skippedtoday = Ticket::where('status','skipped')->whereDate('created_at',$today)->count();

        $quickview = [
            'total' => $total,
            'totaltoday' => $totaltoday,
            'waiting' => $waiting,
            'waitingtoday'=>$waitingtoday,
            'called'=>$called,
            'calledtoday'=>$calledtoday,
            'skipped' => $skipped,
            'skippedtoday'=>$skippedtoday,
        ];

        return response()->json([
            'status'=>true,
            'message'=>'Ticket list retrieved successfully,',
            'ticket'=>$ticket,
            'quickview' => $quickview
        ]);
    }

    public function store($id){
        $service = Service::with('devices')->findOrFail($id);

        $today = Carbon::today()->format('Y-m-d');
        $latestTicket = Ticket::whereDate('created_at', $today)
            ->where('ticket_number', 'like', $service->queue_number.'%')            
            ->orderBy('sequence', 'desc')   
            ->first();

        if (!$latestTicket) {
            $ticketSequence = 1;
        } else {
            $ticketSequence = ($latestTicket->sequence) + 1;
        }
        $formattedSequence = str_pad($ticketSequence, 3, '0', STR_PAD_LEFT);
        $ticketNumber = "{$service->queue_number}{$formattedSequence}";

        try {
            $ticket = new Ticket();
            $ticket->ticket_number = $ticketNumber;
            $ticket->sequence = $ticketSequence;
            $ticket->service_id = $service->id;
            $ticket->save();

            return response()->json([
                'status'=>true,
                'message'=>"Lấy số thành công: ". $ticketNumber,
                'ticket'=>$ticket
            ]);
        }
        catch(\Throwable $e){
            \Log::error('Failed to store ticket', ['error' => $e->getMessage()]);
            return response()->json([
                'status'=>false,
                'message'=> $e->getMessage(),
            ]);
        }
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
        ->when($request->filled('status'), function($q) use ($request){
            $q -> where('status', $request -> status);
        })
        ->when($request->filled('date_from'), function($q) use ($request) {
            $q -> where('created_at', '>=', Carbon::parse($request->date_from));
        })
        ->when($request->filled('date_to'), function($q) use ($request) {
            $q -> where('created_at','<=', \Carbon\Carbon::parse($request->date_to)->endOfDay());
        })
        ->when($request->filled('sort'), function($q) use ($request) {
            $q -> orderBy('id', $request->sort === 'oldest' ? 'asc' : 'desc');
        }, function ($q){
            $q -> orderBy('id','desc');
        })
        ->with('deviceWithTrashed','serviceWithTrashed')
        ->get();

        $ticket_array = [
            [
                'Số thứ tự',
                'Thiết bị',
                'Dịch vụ',
                'Trạng thái',
                'Ngày tạo',
                'Ngày cập nhật'
            ]
        ];

        foreach ($tickets as $ticket) {
            $ticket_array[] = [
                $ticket -> ticket_number,
                optional($ticket->deviceWithTrashed)->name ?? $ticket->device_id,
                optional($ticket->serviceWithTrashed)->name ?? $ticket->service_id,  
                $ticket->status === "called" ? "Đã gọi" : ($ticket->status === "processing"?
            "Đang xử lí": ($ticket->status === "skipped" ? "Bỏ qua" : "Đang chờ")),
                $ticket->created_at->format('Y-m-d H:i:s'),
                $ticket->created_at == $ticket->updated_at ? "" : ($ticket->updated_at ? $ticket->updated_at->format('Y-m-d H:i:s') : "")

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
