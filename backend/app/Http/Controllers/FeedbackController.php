<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Http\Requests\Feedback\StoreFeedbackRequest;
use Illuminate\Http\Request;
use Carbon\Carbon;

class FeedbackController extends Controller
{
    public function index(Request $request){
        $today = Carbon::today()->format('Y-m-d'); 

        $feedback = Feedback::query()
        ->when($request->filled('service_id'), function ($q) use ($request) {
            $q->where('service_id',$request -> service_id);
        })
        ->when($request->filled('device_id'), function ($q) use ($request) {
            $q->where('device_id',$request -> device_id);
        })
        ->when($request->filled('value'), function ($q) use ($request) {
            $q->where('value',$request -> value);
        })
        ->when($request->filled('date_from'), function ($q) use ($request) {
            $q->where('created_at', '>=' , Carbon::parse($request->date_from));
        })
        ->when($request->filled('date_to'),function($q) use ($request) {
            $q->where('created_at', '<=', \Carbon\Carbon::parse($request->date_to)->endOfDay());
        })
        ->when($request->filled('sort'), function ($q) use ($request) {
            $q->orderBy('id', $request->sort === 'oldest' ? 'asc' : 'desc');
        }, function ($q) {
            $q->orderBy('id', 'desc');
        })
        ->with('ticket.deviceWithTrashed','ticket.serviceWithTrashed')
        ->paginate(8);
 
        $total = Feedback::count();
        $totaltoday = Feedback::whereDate('created_at', $today)->count();

        $positiveQuery = Feedback::whereIn('value', [3, 4]);
        $positive = $positiveQuery->count();
        $positivetoday = $positiveQuery->whereDate('created_at', $today)->count();

        $negativeQuery = Feedback::where('value', 1);
        $negative = $negativeQuery->count();
        $negativetoday = $negativeQuery->whereDate('created_at', $today)->count();

        $neutralQuery = Feedback::where('value', 2);
        $neutral = $neutralQuery -> count();
        $neutraltoday = $neutralQuery -> whereDate('created_at',$today)->count();

        $quickview = [
            'total' => $total,
            'totaltoday' => $totaltoday,
            'positive' => $positive,
            'positivetoday' => $positivetoday,
            'negative' => $negative,
            'negativetoday' => $negativetoday,
            'neutral' => $neutral,
            'neutraltoday'=>$neutraltoday
        ];
 
        return response()->json([
            'status' => true,
            'message' => "Feedback list retrieved successfully.",
            'feedback' => $feedback,
            'quickview'=>$quickview
        ]);
    }

    public function export(Request $request)
    {
        $feedbacks = Feedback::query()
            ->when($request->filled('service_id'), function ($q) use ($request) {
                $q->where('service_id', $request->service_id);
            })
            ->when($request->filled('device_id'), function ($q) use ($request) {
            $q->where('device_id',$request -> device_id);
            })
            ->when($request->filled('value'), function ($q) use ($request) {
            $q->where('value',$request -> value);
            })
            ->when($request->filled('date_from'), function ($q) use ($request) {
                $q->where('created_at', '>=', \Carbon\Carbon::parse($request->date_from));
            })
            ->when($request->filled('date_to'), function ($q) use ($request) {
                $q->where('created_at', '<=', \Carbon\Carbon::parse($request->date_to)->endOfDay());
            })
            ->when($request->filled('sort'), function ($q) use ($request) {
                $q->orderBy('id', $request->sort === 'oldest' ? 'asc' : 'desc');
            }, function ($q) {
                $q->orderBy('id', 'desc');
            })
            ->with('ticket.deviceWithTrashed','ticket.serviceWithTrashed')
            ->get();
        $feedback_array = [
            [
                'Thiết bị',
                'Dịch vụ',
                'Đánh giá',
                'Số thứ tự',
                'Ngày gửi',
            ]
        ];

        foreach ($feedbacks as $feedback) {
            $ticket = optional($feedback->ticket); 
            $feedback_array[] = [
                optional($ticket->deviceWithTrashed)->name ?? $feedback->device_id,
                optional($ticket->serviceWithTrashed)->name ?? $feedback->service_id,
                $feedback->value === 1? "Không hài lòng" :($feedback-> value === 2 ? "Bình thường" : ($feedback -> value === 3 ? "Hài lòng" : "Không hài lòng")),
                optional($ticket)->ticket_number ?? $feedback->ticket_id,
                $feedback->created_at->format('Y-m-d H:i:s'),
            ];
        }
        return $this->downloadExcel($feedback_array, 'feedbacks.xls');
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
