<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Http\Requests\Feedback\StoreFeedbackRequest;
use Illuminate\Http\Request;
use Carbon\Carbon;

class FeedbackController extends Controller
{
    // get feedback list allow filter by service, device, staff, value, datefrom, dateto , sort by created_at
    public function index(Request $request){
        $today = Carbon::today()->format('Y-m-d'); 

        $feedback = Feedback::query()
        ->when($request->filled('service_id'), function ($q) use ($request) {
            $q->where('service_id',$request -> service_id);
        })
        ->when($request->filled('device_id'), function ($q) use ($request) {
            $q->where('device_id',$request -> device_id);
        })
        ->when($request->filled('staff_id'), function ($q) use ($request) {
            $q->where('staff_id', $request->staff_id);
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
        ->with('staffWithTrashed', 'ticket.deviceWithTrashed','ticket.serviceWithTrashed')
        ->paginate(8);

        $startOfDay = Carbon::today()->startOfDay();
        $endOfDay = Carbon::today()->endOfDay();  
        
        $total = Feedback::count();
        $totaltoday = Feedback::whereBetween('created_at', [$startOfDay, $endOfDay])->count();

        $positiveQuery = Feedback::whereIn('value', [3, 4]);
        $positive = $positiveQuery->count();
        $positivetoday = $positiveQuery->whereBetween('created_at', [$startOfDay, $endOfDay])->count();

        $negativeQuery = Feedback::where('value', 1);
        $negative = $negativeQuery->count();
        $negativetoday = $negativeQuery->whereBetween('created_at', [$startOfDay, $endOfDay])->count();

        $neutralQuery = Feedback::where('value', 2);
        $neutral = $neutralQuery -> count();
        $neutraltoday = $neutralQuery ->whereBetween('created_at', [$startOfDay, $endOfDay])->count();

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
    // export feedback is filtering/ limit 1000000 rows at once
    public function export(Request $request)
    {
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '10000M');
        
        $feedbacks = Feedback::query()
            ->when($request->filled('service_id'), function ($q) use ($request) {
                $q->where('service_id', $request->service_id);
            })
            ->when($request->filled('device_id'), function ($q) use ($request) {
                $q->where('device_id', $request->device_id);
            })
            ->when($request->filled('staff_id'), function ($q) use ($request) {
                $q->where('staff_id', $request->staff_id);
            })
            ->when($request->filled('value'), function ($q) use ($request) {
                $q->where('value', $request->value);
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
            ->with('staffWithTrashed','ticket.deviceWithTrashed', 'ticket.serviceWithTrashed')
            ->get();

        // Check size limit
        if ($feedbacks->count() > 1000000) {
            return response()->json(['error' => 'File quá lớn. Xin chia nhỏ thời gian và xuất lại.'], 400);
        }

        $feedback_array = [
            [
                'Nhân viên',
                'Thiết bị',
                'Dịch vụ',
                'Đánh giá',
                'Số thứ tự',
                'Ngày gửi',
            ]
        ];

        foreach ($feedbacks as $feedback) {
            $ticket = optional($feedback->ticket); 
            $staff = optional($feedback->staffWithTrashed); 
            $feedback_array[] = [
                optional($staff)->name ?? $feedback->staff_id,
                optional($ticket->deviceWithTrashed)->name ?? $feedback->device_id,
                optional($ticket->serviceWithTrashed)->name ?? $feedback->service_id,
                $feedback->value === 1 ? "Không hài lòng" : ($feedback->value === 2 ? "Bình thường" : ($feedback->value === 3 ? "Hài lòng" : "Rất hài lòng")),
                optional($ticket)->ticket_number ?? $feedback->ticket_id,
                $feedback->created_at ? $feedback->created_at->format('H:i:s d/m/Y') : "",
            ];
        }
        
        return $this->downloadExcel($feedback_array, 'feedbacks.xlsx');
    }

    // after export automatically download the excel file
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

    //get the feedback of the staff by month, show stats about the selected month compare to the previous month
    public function getMonthlyStats(Request $request)
    {
        $month = $request->input('month'); // Format: "2025-01"
        $staffId = $request->input('staff_id');

        if (!$month) {
            return response()->json(['error' => 'Month parameter is required'], 400);
        }

        try {
            $startOfMonth = Carbon::parse($month .  '-01')->startOfMonth();
            $endOfMonth = Carbon:: parse($month . '-01')->endOfMonth();

            // Previous month
            $previousMonthStart = (clone $startOfMonth)->subMonth()->startOfMonth();
            $previousMonthEnd = (clone $startOfMonth)->subMonth()->endOfMonth();

            // Monthly query (selected month)
            $monthlyQuery = Feedback::whereBetween('created_at', [$startOfMonth, $endOfMonth]);
            
            // Previous month query
            $previousQuery = Feedback::whereBetween('created_at', [$previousMonthStart, $previousMonthEnd]);
            
            // All-time query
            $allTimeQuery = Feedback::query();

            if ($staffId) {
                $monthlyQuery->where('staff_id', $staffId);
                $previousQuery->where('staff_id', $staffId);
                $allTimeQuery->where('staff_id', $staffId);
            }

            // Monthly stats
            $verySatisfiedMonth = (clone $monthlyQuery)->where('value', 4)->count();
            $satisfiedMonth = (clone $monthlyQuery)->where('value', 3)->count();
            $negativeMonth = (clone $monthlyQuery)->where('value', 1)->count();
            $neutralMonth = (clone $monthlyQuery)->where('value', 2)->count();
            $totalMonth = $verySatisfiedMonth + $satisfiedMonth + $negativeMonth + $neutralMonth;

            // Previous month stats
            $verySatisfiedPrev = (clone $previousQuery)->where('value', 4)->count();
            $satisfiedPrev = (clone $previousQuery)->where('value', 3)->count();
            $negativePrev = (clone $previousQuery)->where('value', 1)->count();
            $neutralPrev = (clone $previousQuery)->where('value', 2)->count();

            // All-time stats
            $verySatisfiedAll = (clone $allTimeQuery)->where('value', 4)->count();
            $satisfiedAll = (clone $allTimeQuery)->where('value', 3)->count();
            $negativeAll = (clone $allTimeQuery)->where('value', 1)->count();
            $neutralAll = (clone $allTimeQuery)->where('value', 2)->count();
            $totalAll = $verySatisfiedAll + $satisfiedAll + $negativeAll + $neutralAll;

            // Calculate trends
            $calculateTrend = function($current, $previous) {
                if ($previous == 0) {
                    return $current > 0 ? 100 : 0;
                }
                return round((($current - $previous) / $previous) * 100, 1);
            };

            return response()->json([
                'status' => true,
                'month' => $month,
                // Monthly stats
                'total' => $totalMonth,
                'very_satisfied' => $verySatisfiedMonth,
                'satisfied' => $satisfiedMonth,
                'negative' => $negativeMonth,
                'neutral' => $neutralMonth,
                // All-time stats
                'total_all_time' => $totalAll,
                'very_satisfied_all_time' => $verySatisfiedAll,
                'satisfied_all_time' => $satisfiedAll,
                'negative_all_time' => $negativeAll,
                'neutral_all_time' => $neutralAll,
                // Trends
                'trends' => [
                    'very_satisfied' => $calculateTrend($verySatisfiedMonth, $verySatisfiedPrev),
                    'satisfied' => $calculateTrend($satisfiedMonth, $satisfiedPrev),
                    'neutral' => $calculateTrend($neutralMonth, $neutralPrev),
                    'negative' => $calculateTrend($negativeMonth, $negativePrev),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid month format'], 400);
        }
    }
}
