<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $dates = ['deleted_at'];
    //
    protected $table = 'comments';

    protected $hidden = ['deleted_at'];

    public function author(){
        return $this->belongsTo('App\Models\User', 'user_id');
    }
}
