<?php

use App\Http\Controllers\AnalysisGroupController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OpenPositionController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('transactions/import', [TransactionController::class, 'import'])->name('transactions.import');
    Route::post('transactions/import', [TransactionController::class, 'storeImport'])->name('transactions.importstore');
    Route::get('transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::post('transactions/clear', [TransactionController::class, 'clear'])->name('transactions.clear');

    Route::get('open-positions', [OpenPositionController::class, 'index'])->name('openpositions.index');

    Route::get('trade-matching', [AnalysisGroupController::class, 'index'])->name('tradematching.index');
    Route::post('trade-matching', [AnalysisGroupController::class, 'store'])->name('tradematching.store');
    Route::get('trade-matching/{analysisGroup:key_analysis_group}', [AnalysisGroupController::class, 'show'])->name('tradematching.show');
    Route::delete('trade-matching/{analysisGroup:key_analysis_group}', [AnalysisGroupController::class, 'destroy'])->name('tradematching.destroy');
    Route::post('trade-matching/{analysisGroup:key_analysis_group}/transactions', [AnalysisGroupController::class, 'attach'])->name('tradematching.attach');
    Route::delete('trade-matching/{analysisGroup:key_analysis_group}/transactions/{transaction}', [AnalysisGroupController::class, 'detach'])->name('tradematching.detach');
});

require __DIR__.'/settings.php';
