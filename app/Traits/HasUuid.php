<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait HasUuid
{
    protected static function bootHasUuid()
    {
        static::creating(function ($model) {
            if (empty($model->key_analysis_group)) {
                $model->key_analysis_group = (string) Str::uuid();
            }
        });
    }
}
