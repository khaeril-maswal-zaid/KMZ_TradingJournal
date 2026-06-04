<?php

use App\Http\Controllers\AnalysisGroupController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('transactions/import', [TransactionController::class, 'import'])->name('transactions.import');
    Route::post('transactions/import', [TransactionController::class, 'storeImport'])->name('transactions.import.store');
    Route::get('transactions', [TransactionController::class, 'index'])->name('transactions.index');

    Route::get('analysis-groups', [AnalysisGroupController::class, 'index'])->name('analysis-groups.index');
    Route::post('analysis-groups', [AnalysisGroupController::class, 'store'])->name('analysis-groups.store');
    Route::get('analysis-groups/{analysisGroup}', [AnalysisGroupController::class, 'show'])->name('analysis-groups.show');
    Route::post('analysis-groups/{analysisGroup}/transactions', [AnalysisGroupController::class, 'attach'])->name('analysis-groups.transactions.attach');
    Route::delete('analysis-groups/{analysisGroup}/transactions/{transaction}', [AnalysisGroupController::class, 'detach'])->name('analysis-groups.transactions.detach');
});

require __DIR__.'/settings.php';
