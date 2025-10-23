<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Http\Requests\Feedback\StoreFeedbackRequest;
use Illuminate\Http\Request;
use App\Models\ActivityLog;
use Carbon\Carbon;
class FeedbackController extends Controller
{
    public function index(Request $request){
        $feedback = Feedback::query()
        ->when($request->filled('service_id'), function ($q) use ($request) {
            $q->where('service_id',$request -> service_id);
        })
        ->when($request->filled('device_id'), function ($q) use ($request) {
            $q->where('device_id',$request -> device_id);
        })
        ->when($request->filled('date_from'), function ($q) use ($request) {
            $q->where('created_at', '>=' , Carbon::parse($request->date_from));
        })
        ->when($request->filled('date_to'),function($q) use ($request) {
            $q->where('created_at', '<=', \Carbon\Carbon::parse($request->date_to)->endOfDay());
        })
        ->when($request->filled('sort'), function ($q) use ($request) {
            $q->orderBy('created_at', $request->sort === 'oldest' ? 'asc' : 'desc');
        }, function ($q) {
            $q->orderBy('created_at', 'desc');
        })
        ->with('device','service','ticket.device','ticket.service')
        ->paginate(8);

        \Log::debug(Carbon::parse($request->date_from));
        \Log::debug(Carbon::parse($request->date_to)->endOfDay());

        return response()->json([
            'status' => true,
            'message' => "Feedback list retrieved successfully",
            'feedback' => $feedback
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
            ->when($request->filled('date_from'), function ($q) use ($request) {
                $q->where('created_at', '>=', \Carbon\Carbon::parse($request->date_from));
            })
            ->when($request->filled('date_to'), function ($q) use ($request) {
                $q->where('created_at', '<=', \Carbon\Carbon::parse($request->date_to)->endOfDay());
            })
            ->when($request->filled('sort'), function ($q) use ($request) {
                $q->orderBy('created_at', $request->sort === 'oldest' ? 'asc' : 'desc');
            }, function ($q) {
                $q->orderBy('created_at', 'desc');
            })
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
            $feedback_array[] = [
                // $feedback->id,
                optional($feedback->device)->name ?? $feedback->device_id,
                optional($feedback->service)->name ?? $feedback->service_id,
                // optional($feedback->user)->name ?? $feedback->user_id,  
                // $feedback->content,
                $feedback->value === 1? "Không hài lòng" :($feedback-> value === 2 ? "Bình thường" : ($feedback -> value === 3 ? "Hài lòng" : "Không hài lòng")),
                optional($feedback->ticket)->ticket_number ?? $feedback->ticket_id,
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



    public function store(StoreFeedbackRequest $request){

        $feedback = new Feedback();
        $feedback -> device_id = $request -> device_id;
        $feedback -> service_id = $request -> service_id;
        $feedback -> user_id = auth()->id();
        $feedback -> value = $request -> value;
        
        $feedback -> save();
        $this->logActivity(
            auth()->id(),
            'Feedback',
            'Create',
            [
                'feedback' => $feedback->service_id,
                'changes' => "Create new feedback: " . $feedback -> value,
            ],
        );

        return response()->json([
            'status' => true,
            'message' => "Feedback create successfully",
            'feedback'=> $feedback
        ]);
    }

    public function show($id){
        $feedback = Feedback::findOrFail($id);

        if(!$feedback){
            return response()->json([
                'status'=>false,
                'message'=>"Feedback not found"
            ]);
        }
        return response()->json([
            'status'=> true,
            'message'=>"Feedback retrieve successfully.",
            'feedback'=>$feedback
        ]);
    }

    private function logActivity($userId, $actorType,$action, array $details)
    {
        ActivityLog::create([
            'actor_id' => $userId,
            'actor_type' => $actorType,
            'action' => $action,
            'context' => json_encode($details),
        ]);
    }

}
