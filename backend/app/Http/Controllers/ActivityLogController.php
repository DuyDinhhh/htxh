<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class ActivityLogController extends Controller
{
    // Return list about user activity allow filter by log_name, event, datefrom, dateto, sort by created_at
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 15);

        $logs = Activity::query()
            ->where('log_name', '!=', 'mqtt')
            ->when($request->filled('log_name'), function ($q) use ($request) {
                $q->where('log_name', $request->log_name);
            })
            ->when($request->filled('event'), function ($q) use ($request) {
                $q->where('event', $request->event);
            })
            ->when($request->filled('causer_type'), function ($q) use ($request) {
                $q->where('causer_type', $request->causer_type);
            })
            ->when($request->filled('causer_id'), function ($q) use ($request) {
                $q->where('causer_id', $request->causer_id);
            })
            ->when($request->filled('date_from'), function ($q) use ($request) {
                $q->where('created_at', '>=', Carbon::parse($request->date_from)->startOfDay());
            })
            ->when($request->filled('date_to'), function ($q) use ($request) {
                $q->where('created_at', '<=', Carbon::parse($request->date_to)->endOfDay());
            })
            ->when($request->filled('q'), function ($q) use ($request) {
                $term = '%'.$request->q.'%';
                $q->where(function ($qq) use ($term) {
                    $qq->where('description', 'like', $term)
                       ->orWhere('properties', 'like', $term);
                });
            })
            ->when($request->filled('sort'), function ($q) use ($request) {
                $direction = ($request->sort === 'oldest') ? 'asc' : 'desc';
                 if (in_array(strtolower($request->sort), ['asc','desc'], true)) {
                    $direction = strtolower($request->sort);
                }
                $q->orderBy('created_at', $direction);
            }, function ($q) {
                $q->orderBy('created_at', 'desc');
            })
            ->with(['subject', 'causer'])
            ->paginate($perPage);

        return response()->json([
            'status' => true,
            'data'   => $logs,
        ]);
    }

    // Return list about mqtt messages allow filter by log_name, event, datefrom, dateto, sort by created_at
    public function deployment(Request $request)
    {
        $perPage = (int) $request->input('per_page', 15);
        $logs = Activity::query()
            ->when($request->filled('log_name'), function ($q) use ($request) {
                $q->where('log_name', $request->log_name);
            })
            ->when($request->filled('event'), function ($q) use ($request) {
                $q->where('event', $request->event);
            })
            ->when($request->filled('causer_type'), function ($q) use ($request) {
                $q->where('causer_type', $request->causer_type);
            })
            ->when($request->filled('causer_id'), function ($q) use ($request) {
                $q->where('causer_id', $request->causer_id);
            })
            ->when($request->filled('date_from'), function ($q) use ($request) {
                $q->where('created_at', '>=', Carbon::parse($request->date_from)->startOfDay());
            })
            ->when($request->filled('date_to'), function ($q) use ($request) {
                $q->where('created_at', '<=', Carbon::parse($request->date_to)->endOfDay());
            })
            ->when($request->filled('q'), function ($q) use ($request) {
                $term = '%'.$request->q.'%';
                $q->where(function ($qq) use ($term) {
                    $qq->where('description', 'like', $term)
                       ->orWhere('properties', 'like', $term);
                });
            })
            ->when($request->filled('sort'), function ($q) use ($request) {
                $direction = ($request->sort === 'oldest') ? 'asc' : 'desc';
                 if (in_array(strtolower($request->sort), ['asc','desc'], true)) {
                    $direction = strtolower($request->sort);
                }
                $q->orderBy('created_at', $direction);
            }, function ($q) {
                $q->orderBy('created_at', 'desc');
            })
            ->where('log_name','mqtt')
            ->with(['subject', 'causer'])
            ->paginate($perPage);

        return response()->json([
            'status' => true,
            'data'   => $logs,
        ]);
    }

    /**
     * GET /api/activity-logs/{id}
     * Xem chi tiết 1 log
     */
    public function show($id)
    {
        $log = Activity::with(['subject','causer'])->findOrFail($id);

        return response()->json([
            'status' => true,
            'data'   => $log,
        ]);
    }


}
