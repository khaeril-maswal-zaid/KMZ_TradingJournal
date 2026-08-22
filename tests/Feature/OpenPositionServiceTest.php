<?php

use App\Models\AnalysisGroup;
use App\Models\OpenPosition;
use App\Models\Transaction;
use App\Models\User;
use App\Services\AnalysisGroupCalculationService;

test('analysis group recalculation creates an open position for remaining asset', function () {
    $user = User::factory()->create();
    $group = AnalysisGroup::create(['user_id' => $user->id]);

    $buyOne = Transaction::factory()->create([
        'user_id' => $user->id,
        'pair' => 'BTCUSDT',
        'base_asset' => 'BTC',
        'quote_asset' => 'USDT',
        'type' => 'BUY',
        'price' => 100000,
        'amount' => 0.00010,
        'total' => 10,
    ]);
    $buyTwo = Transaction::factory()->create([
        'user_id' => $user->id,
        'pair' => 'BTCUSDT',
        'base_asset' => 'BTC',
        'quote_asset' => 'USDT',
        'type' => 'BUY',
        'price' => 110000,
        'amount' => 0.00020,
        'total' => 22,
    ]);
    $sell = Transaction::factory()->create([
        'user_id' => $user->id,
        'pair' => 'BTCUSDT',
        'base_asset' => 'BTC',
        'quote_asset' => 'USDT',
        'type' => 'SELL',
        'price' => 120000,
        'amount' => 0.00028,
        'total' => 33.6,
    ]);

    $group->transactions()->attach([$buyOne->id, $buyTwo->id, $sell->id]);

    app(AnalysisGroupCalculationService::class)->recalculate($group);

    $position = OpenPosition::firstOrFail();

    expect($position->source_analysis_group_id)->toBe($group->id);
    expect($position->asset)->toBe('BTC');
    expect($position->status)->toBe(OpenPosition::STATUS_OPEN);
    $this->assertEqualsWithDelta(106666.66666666667, (float) $position->buy_price, 0.0001);
    $this->assertEqualsWithDelta(0.00002, (float) $position->remaining_amount, 0.00000001);
    $this->assertEqualsWithDelta(2.1333333333, (float) $position->total, 0.0001);
});

test('analysis group recalculation does not create an open position without sell transaction', function () {
    $user = User::factory()->create();
    $group = AnalysisGroup::create(['user_id' => $user->id]);

    $buy = Transaction::factory()->create([
        'user_id' => $user->id,
        'pair' => 'SOLUSDT',
        'base_asset' => 'SOL',
        'quote_asset' => 'USDT',
        'type' => 'BUY',
        'price' => 150,
        'amount' => 10,
        'total' => 1500,
    ]);

    $group->transactions()->attach($buy->id);

    app(AnalysisGroupCalculationService::class)->recalculate($group);

    expect(OpenPosition::count())->toBe(0);
});

test('analysis group recalculation does not create an open position when sell uses all buy amount', function () {
    $user = User::factory()->create();
    $group = AnalysisGroup::create(['user_id' => $user->id]);

    $buy = Transaction::factory()->create([
        'user_id' => $user->id,
        'pair' => 'BNBUSDT',
        'base_asset' => 'BNB',
        'quote_asset' => 'USDT',
        'type' => 'BUY',
        'price' => 600,
        'amount' => 3,
        'total' => 1800,
    ]);
    $sell = Transaction::factory()->create([
        'user_id' => $user->id,
        'pair' => 'BNBUSDT',
        'base_asset' => 'BNB',
        'quote_asset' => 'USDT',
        'type' => 'SELL',
        'price' => 650,
        'amount' => 3,
        'total' => 1950,
    ]);

    $group->transactions()->attach([$buy->id, $sell->id]);

    app(AnalysisGroupCalculationService::class)->recalculate($group);

    expect(OpenPosition::count())->toBe(0);
});

test('analysis group recalculation updates existing open position without duplicates', function () {
    $user = User::factory()->create();
    $group = AnalysisGroup::create(['user_id' => $user->id]);

    $buy = Transaction::factory()->create([
        'user_id' => $user->id,
        'pair' => 'ETHUSDT',
        'base_asset' => 'ETH',
        'quote_asset' => 'USDT',
        'type' => 'BUY',
        'price' => 3000,
        'amount' => 2,
        'total' => 6000,
    ]);
    $sell = Transaction::factory()->create([
        'user_id' => $user->id,
        'pair' => 'ETHUSDT',
        'base_asset' => 'ETH',
        'quote_asset' => 'USDT',
        'type' => 'SELL',
        'price' => 3200,
        'amount' => 1.5,
        'total' => 4800,
    ]);

    $group->transactions()->attach([$buy->id, $sell->id]);

    $calculator = app(AnalysisGroupCalculationService::class);
    $calculator->recalculate($group);

    $sell->forceFill([
        'amount' => 2,
        'total' => 6400,
    ])->save();

    $calculator->recalculate($group);

    $position = OpenPosition::firstOrFail();

    expect(OpenPosition::count())->toBe(1);
    expect($position->status)->toBe(OpenPosition::STATUS_CLOSED);
    $this->assertEqualsWithDelta(0, (float) $position->remaining_amount, 0.00000001);
    $this->assertEqualsWithDelta(0, (float) $position->total, 0.00000001);
});
