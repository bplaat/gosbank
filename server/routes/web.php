<?php

Router::get('/', function () {
    return view('index');
});

Router::get('/offline', function () {
    return view('offline');
});

Router::fallback(function () {
    http_response_code(404);
    return view('notfound');
});
