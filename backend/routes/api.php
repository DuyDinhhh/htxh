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
use App\Http\Controllers\ButtonConfigController;
use App\Http\Controllers\QRCodeController;
use App\Http\Controllers\DashboardController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/config',[ConfigController::class,'index']);
Route::get('/config/buttons', [ButtonConfigController::class, 'index']);
Route::get('/ticket/validate-qr', [QRCodeController::class, 'validateQR']);
Route::get('/ticket/generate-new-qr', [QRCodeController::class, 'generateNewQR']);
Route::post('/ticket/{id}',[TicketController::class,'store']);
Route::get('/service/list',[ServiceController::class,'list']);



Route::middleware('jwt')->group(function () {

    Route::get('/columnChart',[DashboardController::class,'columnChart']);
    Route::get('/circleChart',[DashboardController::class,'circleChart']);
    Route::get('/feedbackChart',[DashboardController::class,'feedbackChart']);
            
    Route::get('/feedback',[FeedbackController::class,'index']);
    Route::get('/feedback/export', [FeedbackController::class, 'export']);

    Route::prefix('service')->group(function(){
        Route::get('/',[ServiceController::class,'index']);
        Route::get('/{id}',[ServiceController::class,'show']);
        Route::post('/',[ServiceController::class,'store']);
        Route::put('/{id}/',[ServiceController::class,'update']);
        Route::delete('/{id}',[ServiceController::class,'destroy']);
    });

    Route::prefix('config')->group(function(){
        Route::post('/buttons', [ButtonConfigController::class, 'save']);
        Route::post('/', [ConfigController::class, 'store']); 
        Route::post('/{id}', [ConfigController::class, 'update']); 
        Route::get('reset',[ConfigController::class, 'resetNumber']);
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
        Route::get('/export',[TicketController::class,'export']);
    });

    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    Route::get('/deployment-logs', [ActivityLogController::class, 'deployment']);
    Route::get('/devices/{device}/activity-logs', [ActivityLogController::class, 'forDevice']);
    Route::get('/services/{service}/activity-logs', [ActivityLogController::class, 'forService']);

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/changePassword/{id}', [UserController::class, 'changePassword']);
});