<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\Service;
use Carbon\Carbon;
use App\Models\Feedback;
class DashboardController extends Controller
{
    //get data for the column chart in homepage of the dashboard
    public function columnChart()
    {
        $months = [
            Carbon::now()->subMonth(2)->startOfMonth()->toDateString(),
            Carbon::now()->subMonth(1)->startOfMonth()->toDateString(),
            Carbon::now()->subMonth(0)->startOfMonth()->toDateString(),
        ];

        $ticketForMonths = [];
        $activeAndTrashServices = Service::withTrashed()->pluck('id'); 
   
        foreach ($months as $month) {
            $ticketForMonth = Ticket::with('service')
                ->whereBetween('created_at', [$month, Carbon::parse($month)->endOfMonth()->toDateString()])
                ->whereIn('service_id', $activeAndTrashServices)  
                ->groupBy('service_id')
                ->selectRaw('service_id, COUNT(*) as ticket_count')
                ->get();
            
            $ticketForMonths[] = [
                'month' => 'Tháng ' . Carbon::parse($month)->format('m'), 
                'tickets' => $ticketForMonth,
            ];
        }
        \Log::debug($ticketForMonths);

        return response()->json($ticketForMonths);
    }
    //get data for the circle chart in homepage of the dashboard
    public function circleChart()
    {
        $now = Carbon::now();
        $activeAndTrashServices = Service::whereHas('devices')->pluck('id');
        
        $ticketCountToday = Ticket::whereBetween('created_at', [
                Carbon::today()->startOfDay(), 
                $now
            ])
            ->whereIn('service_id', $activeAndTrashServices)
            ->count();
        
        $yesterdaySameTime = Carbon::yesterday()->setTime($now->hour, $now->minute, $now->second);
        $ticketCountYesterday = Ticket::whereBetween('created_at', [
                Carbon::yesterday()->startOfDay(),
                $yesterdaySameTime
            ])
            ->whereIn('service_id', $activeAndTrashServices)
            ->count();
        
        $percentageChange = 0;
        if ($ticketCountYesterday > 0) {
            $percentageChange = (($ticketCountToday - $ticketCountYesterday) / $ticketCountYesterday) * 100;
        }
        
        $data = [
            'today' => $ticketCountToday,
            'yesterday' => $ticketCountYesterday,
            'percentage_change' => round($percentageChange, 2)  
        ];
        return response()->json($data);
    }
    //get data for the feedback chart in homepage of the dashboard
    public function feedbackChart()
    {
        $currentMonthStart = Carbon::now()->startOfMonth();
        $currentMonthEnd = Carbon::now()->endOfMonth();
        
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        $currentMonthFeedbacks = Feedback::whereBetween('created_at', [$currentMonthStart, $currentMonthEnd])
            ->whereIn('value', [1, 2, 3, 4])  
            ->pluck('value');  
        $lastMonthFeedbacks = Feedback::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->whereIn('value', [1, 2, 3, 4])
            ->pluck('value');

        $currentMonthAverage = $currentMonthFeedbacks->count() > 0 
            ? $currentMonthFeedbacks->avg() 
            : 0;
        $lastMonthAverage = $lastMonthFeedbacks->count() > 0 
            ? $lastMonthFeedbacks->avg() 
            : 0;

        $currentMonthPercentage = ($currentMonthAverage / 4) * 100;
        $lastMonthPercentage = ($lastMonthAverage / 4) * 100;
 
        $percentageChange = 0;
        if ($lastMonthPercentage > 0) {
            $percentageChange = (($currentMonthPercentage - $lastMonthPercentage) / $lastMonthPercentage) * 100;
        } elseif ($currentMonthPercentage > 0) {
            $percentageChange = 100; 
        }

        $data = [
            'current_month_percentage' => round($currentMonthPercentage, 2),
            'last_month_percentage' => round($lastMonthPercentage, 2),
            'percentage_change' => round($percentageChange, 2),
        ];

        return response()->json($data);
    }

}
