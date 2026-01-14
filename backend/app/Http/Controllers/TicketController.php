<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Service;
use App\Models\Device;
use App\Models\Customer;

use App\Models\Ticket;
use Carbon\Carbon;
use Spatie\Activitylog\Models\Activity;
use App\Http\Requests\Ticket\StoreTicketRequest;
use Illuminate\Support\Facades\DB;

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
        ->with('deviceWithTrashed','serviceWithTrashed','customer')
        ->paginate(8);

        $startOfDay = Carbon::today()->startOfDay();
        $endOfDay = Carbon::today()->endOfDay();  

        $total = Ticket::count();
        $totaltoday = Ticket::whereBetween('created_at', [$startOfDay, $endOfDay])->count();

        $waiting = Ticket::where('status','waiting')->count();
        $waitingtoday = Ticket::where('status','waiting')->whereBetween('created_at', [$startOfDay, $endOfDay])->count();

        $called = Ticket::where('status','called')->count();
        $calledtoday = Ticket::where('status','called')->whereBetween('created_at', [$startOfDay, $endOfDay])->count();

        $skipped = Ticket::where('status','skipped')->count();
        $skippedtoday = Ticket::where('status','skipped')->whereBetween('created_at', [$startOfDay, $endOfDay])->count();

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

    public function store(StoreTicketRequest $request, $id){
        $service = Service::with('devices')->findOrFail($id);

        $startOfDay = Carbon::today()->startOfDay();
        $endOfDay = Carbon::today()->endOfDay();     

        DB::beginTransaction();
        try {
            $data = $request->customerData();
            $customer = null;
            $customer = Customer::updateOrCreate(
                    ['cccd' => $data['cccd']],
                        $data
                    );
            $latestTicket = Ticket::where('ticket_number', 'like', $service->queue_number.'%')  
                ->whereBetween('created_at', [$startOfDay, $endOfDay])
                ->orderBy('sequence', 'desc')   
                ->limit(1)
                ->first();

            if (!$latestTicket) {
                $ticketSequence = 1;
            } else {
                $ticketSequence = ($latestTicket->sequence) + 1;
            }
            
            $formattedSequence = str_pad($ticketSequence, 3, '0', STR_PAD_LEFT);
            $ticketNumber = "{$service->queue_number}{$formattedSequence}";

            $ticket = new Ticket();
            $ticket->ticket_number = $ticketNumber;
            $ticket->sequence = $ticketSequence;
            $ticket->service_id = $service->id;
            $ticket->customer_id = $customer->id;
            $ticket->updated_at = null;
            $ticket->save();

            DB::commit();
            return response()->json([
                'status'=>true,
                'message'=>"Lấy số thành công: ". $ticketNumber,
                'ticket'=>$ticket
            ]);
        }
        catch(\Throwable $e){
            DB::rollBack();
            \Log::error('Failed to store ticket', ['error' => $e->getMessage()]);
            activity()
                ->useLog('ticket')    
                ->event('error')  
                ->withProperties([
                    'message' => $e->getMessage(),
                ])
                ->log('Failed to store ticket');
                
            return response()->json([
                'status'=>false,
                'message'=> $e->getMessage(),
            ]);
        }
    }

    public function export(Request $request)
    {
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '10000M');
        
        $tickets = Ticket::query()
            ->when($request->filled('service_id'), function ($q) use ($request){
                $q->where('service_id', $request->service_id);
            })
            ->when($request->filled('device_id'), function($q) use ($request){
                $q->where('device_id', $request->device_id);
            })
            ->when($request->filled('status'), function($q) use ($request){
                $q->where('status', $request->status);
            })
            ->when($request->filled('date_from'), function($q) use ($request) {
                $q->where('created_at', '>=', Carbon::parse($request->date_from));
            })
            ->when($request->filled('date_to'), function($q) use ($request) {
                $q->where('created_at','<=', \Carbon\Carbon::parse($request->date_to)->endOfDay());
            })
            ->when($request->filled('sort'), function($q) use ($request) {
                $q->orderBy('id', $request->sort === 'oldest' ? 'asc' : 'desc');
            }, function ($q){
                $q->orderBy('id','desc');
            })
            ->with('deviceWithTrashed','serviceWithTrashed')
            ->get();

        if ($tickets->count() > 1000000) {
            return response()->json(['error' => 'File quá lớn. Xin chia nhỏ thời gian và xuất lại.'], 400);
        }

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
                $ticket->ticket_number,
                optional($ticket->deviceWithTrashed)->name ?? $ticket->device_id,
                optional($ticket->serviceWithTrashed)->name ?? $ticket->service_id,  
                $ticket->status === "called" ? "Đã gọi" : ($ticket->status === "processing" ?
                    "Đang xử lí" : ($ticket->status === "skipped" ? "Bỏ qua" : "Đang chờ")),
                $ticket->created_at ? $ticket->created_at->format('H:i:s d/m/Y') : "",
                $ticket->updated_at ? $ticket->updated_at->format('H:i:s d/m/Y') : ""
            ];
        }
        
        return $this->downloadExcel($ticket_array, 'ticket.xlsx');  
    }

    protected function downloadExcel(array $data, string $filename = 'export.xlsx')
    {
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '10000M');

        try {
            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
                $sheet->getDefaultColumnDimension()->setWidth(20);
                $sheet->fromArray($data);

                $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);

                return response()->streamDownload(function () use ($writer) {
                    $writer->save('php://output');
                }, $filename, [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  
                    'Cache-Control' => 'max-age=0',
                ]);
            } catch (\Exception $e) {
                \Log::error($e);
                return response()->json(['error' => 'Failed to export Excel.'], 500);
        }
    }

}
