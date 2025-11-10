<?php
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\DeviceConfigController;
use App\Http\Controllers\ConfigController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TicketController;

Route::get('/', function () {
    return response()->json(['message' => 'Hello world!']);
});
        
Route::get('/feedback',[FeedbackController::class,'index']);
Route::get('/feedback/export', [FeedbackController::class, 'export']);

Route::prefix('service')->group(function(){
    Route::get('/',[ServiceController::class,'index']);
    Route::get('/list',[ServiceController::class,'list']);
    Route::get('/{id}',[ServiceController::class,'show']);
    Route::post('/',[ServiceController::class,'store']);
    Route::put('/{id}/',[ServiceController::class,'update']);
    Route::delete('/{id}',[ServiceController::class,'destroy']);
});

Route::prefix('config')->group(function(){
    Route::get('/',[ConfigController::class,'index']);
    Route::post('/', [ConfigController::class, 'store']); 
    Route::put('/{id}', [ConfigController::class, 'update']); 
});

Route::prefix('device')->group(function(){
    Route::get('/',[DeviceController::class,'index']);
    Route::get('/list',[DeviceController::class,'list']);
    Route::get('/{id}',[DeviceController::class,'show']);
    Route::put('/{id}/assignService',[DeviceController::class,'assignService']);
    Route::delete('/{id}',[DeviceController::class,'destroy']);
});
Route::prefix('/ticket')->group(function(){
    Route::get('/',[TicketController::class,'index']);
    Route::post('/{id}',[TicketController::class,'store']);
    Route::get('/queue_display',[TicketController::class,'queue_display']);
    Route::get('/export',[TicketController::class,'export']);
});

Route::get('/debug',[TicketController::class,'debug']);

Route::post('/ticket/{id}',[TicketController::class,'store']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/activity-logs', [ActivityLogController::class, 'index']);
Route::get('/deployment-logs', [ActivityLogController::class, 'deployment']);
 
Route::get('/devices/{device}/activity-logs', [ActivityLogController::class, 'forDevice']);
Route::get('/services/{service}/activity-logs', [ActivityLogController::class, 'forService']);

Route::middleware('jwt')->group(function () {
    Route::put('/user', [AuthController::class, 'updateUser']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', [AuthController::class, 'getUser']);
        // Service routes
    // Route::get('/services', [ServiceController::class, 'index']);
    // Route::post('/service', [ServiceController::class, 'store']);

    // Device routes
    // Route::prefix('device')->group(function(){
    //     Route::get('/',[DeviceController::class,'index']);
    //     Route::post('/register',[DeviceController::class,'register']);
    //     Route::post('/{id}/heartbeat',[DeviceController::class,'heartbeat']);
    //     Route::post('/{id}/assign-service',[DeviceController::class,'assignService']);

    //     Route::get('/{id}/config',[DeviceConfigController::class,'config']);
    //     Route::post('/{id}/config',[DeviceConfigController::class,'store']);
    // });



    Route::prefix('feedback')->group(function(){
        // Route::get('/',[FeedbackController::class,'index']);
        Route::post('/store',[FeedbackController::class,'store']);
        Route::get('/{id}',[FeedbackController::class,'show']);
    });

    // Device Config routes
});