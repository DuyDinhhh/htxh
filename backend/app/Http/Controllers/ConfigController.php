<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Config;
use App\Http\Requests\Config\StoreConfigRequest;
use App\Models\Service;
use App\Models\Ticket;
use Carbon\Carbon;

class ConfigController extends Controller
{
    //Get the config for kiosk getumber, queue list tv but ******** do not use anymore**********
    public function index()
    {
        $config = Config::first();
        return response()->json([
            'status' => true,
            'message' => 'Config retrieved successfully',
            'config' => $config
        ]);
    }

    //Get the config for kiosk getumber, queue list tv but ******** do not use anymore**********
    public function store(StoreConfigRequest $request){
        $config = new Config();
        $config->text_top = $request->text_top;
        $config->text_top_color = $request->text_top_color;
        $config->bg_top_color = $request->bg_top_color;

        $config->text_bottom = $request->text_bottom;
        $config->text_bottom_color = $request->text_bottom_color;
        $config->bg_bottom_color = $request->bg_bottom_color;

        $config->bg_middle_color = $request->bg_middle_color;

        $config->table_header_color = $request->table_header_color;
        $config->table_row_odd_color = $request->table_row_odd_color;
        $config->table_row_even_color = $request->table_row_even_color;

        $config->table_text_color = $request->table_text_color;
        $config->table_text_active_color = $request->table_text_active_color;

        if ($request->hasFile('photo')) {
            $oldPhoto = $config->photo;

            if ($oldPhoto) {
                $oldPath = public_path('images/config/' . $oldPhoto);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            $file = $request->file('photo');
            $exten = $file->extension();
            $imageName = 'photo-logo.'. date('YmHis') . $exten;
            $file->move(public_path('images/config'), $imageName);

            $config->photo = $imageName;
        }

        $config->save();

        return response()->json([
            'status' => true,
            'message' => 'Config created successfully.',
            'config' => $config
        ]);
    }
    
    public function update($id, StoreConfigRequest $request)
    {
        $config = Config::findOrFail($id);

        $config->text_top = $request->text_top;
        $config->text_top_color = $request->text_top_color;
        $config->bg_top_color = $request->bg_top_color;

        $config->text_bottom = $request->text_bottom;
        $config->text_bottom_color = $request->text_bottom_color;
        $config->bg_bottom_color = $request->bg_bottom_color;

        $config->bg_middle_color = $request->bg_middle_color;

        $config->table_header_color = $request->table_header_color;
        $config->table_row_odd_color = $request->table_row_odd_color;
        $config->table_row_even_color = $request->table_row_even_color;

        $config->table_text_color = $request->table_text_color;
        $config->table_text_active_color = $request->table_text_active_color;

        if ($request->hasFile('photo')) {
            $oldPhoto = $config->photo;

            if ($oldPhoto) {
                $oldPath = public_path('images/config/' . $oldPhoto);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            $file = $request->file('photo');
            $exten = $file->extension();
            $imageName = 'photo-logo.'.date('YmHis') . $exten;
            $file->move(public_path('images/config'), $imageName);

            $config->photo = $imageName;
        }

        $config->save();

        return response()->json([
            'status' => true,
            'message' => 'Config updated successfully.',
            'config' => $config
        ]);
    }


    // public function resetNumber(){
    //     $services = Service::whereHas('devices')
    //         ->whereNull('deleted_at')
    //         ->get();

    //     $startOfDay = Carbon::today()->startOfDay();
    //     $endOfDay = Carbon::today()->endOfDay();     
        
    //     foreach($services as $service){
    //         $tickets = Ticket::where('service_id', $service->id)
    //             ->whereBetween('created_at', [$startOfDay, $endOfDay])          
    //             ->get();

    //         foreach ($tickets as $ticket) {
    //             $ticket->sequence = 0;  
    //             $ticket->save();
    //         }
    //     }
    //     return response()->json([
    //         'message'=> "Ticket number reset successfully."
    //     ]);
    // }

    public function resetNumber(){
        $services = Service::whereHas('devices')
            ->whereNull('deleted_at')
            ->get();
        
        $startOfDay = Carbon::today()->startOfDay();
        $endOfDay = Carbon::today()->endOfDay();     
        
        $totalUpdated = 0;
        foreach($services as $service){
            $updated = Ticket::where('service_id', $service->id)
                ->whereBetween('created_at', [$startOfDay, $endOfDay])          
                ->update(['sequence' => 0]);
            
            $totalUpdated += $updated;
        }
        
        return response()->json([
            'status' => true,
            'message' => "Đã reset {$totalUpdated} tickets thành công."
        ]);
    }
}
