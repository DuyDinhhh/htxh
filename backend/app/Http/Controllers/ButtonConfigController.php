<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ButtonConfig;
use Illuminate\Support\Facades\DB;

class ButtonConfigController extends Controller
{
    public function index()
    {
        $global = ButtonConfig::whereNull('service_id')->first();
        $services = ButtonConfig::whereNotNull('service_id')->get();

        return response()->json([
            'status'   => true,
            'message'  => 'Ticket button layouts retrieved successfully',
            'data'     => [
                'global'   => $global,
                'services' => $services,
            ],
        ]);
    }

    public function save(Request $request)
    {
        $validated = $request->validate([
            'global'                        => ['nullable', 'array'],
            'global.width'                  => ['nullable', 'integer'],
            'global.height'                 => ['nullable', 'integer'],
            'global.h_align'                => ['nullable', 'string', 'max:20'],
            'global.v_align'                => ['nullable', 'string', 'max:20'],
            'global.use_fixed_on_mobile'    => ['nullable', 'boolean'],

            'services'                      => ['nullable', 'array'],
            'services.*.service_id'         => ['required_with:services', 'integer'],
            'services.*.width'              => ['nullable', 'integer'],
            'services.*.height'             => ['nullable', 'integer'],
            'services.*.h_align'            => ['nullable', 'string', 'max:20'],
            'services.*.v_align'            => ['nullable', 'string', 'max:20'],
            'services.*.x'                  => ['nullable', 'integer'],
            'services.*.y'                  => ['nullable', 'integer'],
        ]);

        DB::beginTransaction();

        try {
             if (!empty($validated['global'])) {
                $globalData = $validated['global'];

                    ButtonConfig::updateOrCreate(
                        ['service_id' => null],
                        [
                            'width' => $globalData['width']   ?? null,
                            'height' => $globalData['height']  ?? null,
                            'h_align' => $globalData['h_align'] ?? null,
                            'v_align' => $globalData['v_align'] ?? null,
                            'use_fixed_on_mobile' => $globalData['use_fixed_on_mobile'] ?? null,
                        ]
                    );
                }

            if (!empty($validated['services']) && is_array($validated['services'])) {
                foreach ($validated['services'] as $item) {
                    ButtonConfig::updateOrCreate(
                        ['service_id' => $item['service_id']],
                        [
                            'width'   => $item['width']   ?? null,
                            'height'  => $item['height']  ?? null,
                            'h_align' => $item['h_align'] ?? null,
                            'v_align' => $item['v_align'] ?? null,
                            'x'       => $item['x']       ?? null,
                            'y'       => $item['y']       ?? null,
                        ]
                    );
                }
            }

            DB::commit();

            $global   = ButtonConfig::whereNull('service_id')->first();
            $services = ButtonConfig::whereNotNull('service_id')->get();

            return response()->json([
                'status'  => true,
                'message' => 'Ticket button layouts saved successfully.',
                'data'    => [
                    'global'   => $global,
                    'services' => $services,
                ],
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'status'  => false,
                'message' => 'Failed to save ticket button layouts.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
