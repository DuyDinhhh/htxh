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
use App\Http\Controllers\StaffController; 

Route::post('/register', [AuthController::class, 'register']); // route to register a new user
Route::post('/login', [AuthController::class, 'login']); // route to authenticate and return JWT

Route::get('/config',[ConfigController::class,'index']); // get public configuration
Route::get('/config/buttons', [ButtonConfigController::class, 'index']); // get button configuration
Route::get('/ticket/validate-qr', [QRCodeController::class, 'validateQR']); // validate a ticket QR code
Route::get('/ticket/generate-new-qr', [QRCodeController::class, 'generateNewQR']); // generate a new QR code for tickets
Route::get('/service/list',[ServiceController::class,'list']); // list services for kiosks/public use

Route::post('/ticket/{id}',[TicketController::class,'store']); // create a new ticket for service {id}
Route::get('/ticket/detail/{id}',[TicketController::class,'show']); // get details of ticket {id}
Route::post('/ticketAuth/{id}',[TicketController::class,'storeAuth']); // create ticket for service {id} via authenticated flow

Route::get('/service/activelist',[ServiceController::class,'activelist']); // list active/enabled services


Route::middleware('jwt')->group(function () { // group routes that require JWT authentication
    Route::prefix('/staff')->group(function(){ // group staff management routes under /staff
        Route::get('/',[StaffController::class,'index']); // list staff (paginated/admin view)
        Route::get('/list',[StaffController::class,'list']); // alternate staff listing for UI tables
        Route::get('/{id}',[StaffController::class,'show']); // get details for staff member {id}
        Route::post('/',[StaffController::class,'store']); // create a new staff member
        Route::put('/{id}',[StaffController::class,'update']); // update staff member {id}
        Route::delete('/{id}',[StaffController::class,'delete']); // delete staff member {id}
    });

    Route::get('/columnChart',[DashboardController::class,'columnChart']); // return data for column chart
    Route::get('/circleChart',[DashboardController::class,'circleChart']); // return data for pie/donut chart
    Route::get('/feedbackChart',[DashboardController::class,'feedbackChart']); // return feedback-related chart data
            

    Route::prefix('/feedback')->group(function(){ // group feedback-related routes under /feedback
        Route::get('/',[FeedbackController::class,'index']); // list feedback entries
        Route::get('/export', [FeedbackController::class, 'export']); // export feedback data (CSV/Excel)
        Route::get('/monthly-stats', [FeedbackController::class, 'getMonthlyStats']); // get monthly aggregated feedback stats
    });

    Route::prefix('service')->group(function(){ // group admin service routes under /service
        Route::get('/',[ServiceController::class,'index']); // list services for admin
        Route::get('/{id}',[ServiceController::class,'show']); // get details of service {id}
        Route::post('/',[ServiceController::class,'store']); // create a new service
        Route::put('/{id}/',[ServiceController::class,'update']); // update service {id}
        Route::delete('/{id}',[ServiceController::class,'destroy']); // delete service {id}
    });

    Route::prefix('config')->group(function(){ // group configuration routes under /config
        Route::post('/buttons', [ButtonConfigController::class, 'save']); // save button configuration
        Route::post('/', [ConfigController::class, 'store']);  // create/store global configuration
        Route::post('/{id}', [ConfigController::class, 'update']);  // update configuration {id}
        Route::get('reset',[ConfigController::class, 'resetNumber']); // reset numbering/counters
    });

    Route::prefix('device')->group(function(){ // group device management routes under /device
        Route::get('/',[DeviceController::class,'index']); // list devices
        Route::get('/list',[DeviceController::class,'list']); // alternate device listing for UI tables
        Route::get('/{id}',[DeviceController::class,'show']); // get device details for {id}
        Route::put('/{id}/assignService',[DeviceController::class,'assignService']); // assign a service to device {id}
        Route::delete('/{id}',[DeviceController::class,'destroy']); // remove/delete device {id}
    });

    Route::prefix('/ticket')->group(function(){ // group admin ticket routes under /ticket
        Route::get('/',[TicketController::class,'index']); // list tickets (admin)
        Route::get('/export',[TicketController::class,'export']); // export tickets (CSV/Excel)
    });

    Route::get('/activity-logs', [ActivityLogController::class, 'index']); // get application activity logs
    Route::get('/deployment-logs', [ActivityLogController::class, 'deployment']); // get deployment/MQTT logs
    Route::get('/devices/{device}/activity-logs', [ActivityLogController::class, 'forDevice']); // get activity logs for specific device
    Route::get('/services/{service}/activity-logs', [ActivityLogController::class, 'forService']); // get activity logs for specific service

    Route::post('/logout', [AuthController::class, 'logout']); // invalidate current token / logout
    Route::put('/changePassword/{id}', [UserController::class, 'changePassword']); // change password for user {id}
}); // end of JWT-protected routes group