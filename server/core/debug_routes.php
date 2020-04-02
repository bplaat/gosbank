<?php

function minify_css ($data){
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => 'https://cssminifier.com/raw',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [ 'Content-Type: application/x-www-form-urlencoded' ],
        CURLOPT_POSTFIELDS => http_build_query([ 'input' => $data ])
    ]);
    $minified_data = curl_exec($curl);
    curl_close($curl);
    return $minified_data;
}

function minify_js ($data) {
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => 'https://javascript-minifier.com/raw',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [ 'Content-Type: application/x-www-form-urlencoded' ],
        CURLOPT_POSTFIELDS => http_build_query([ 'input' => $data ])
    ]);
    $minified_data = curl_exec($curl);
    curl_close($curl);
    return $minified_data;
}

Router::get('/debug/compile', function () {
    $paths = glob(ROOT . '/resources/*');
    foreach ($paths as $path) {
        $pathinfo = pathinfo($path);
        if ($pathinfo['extension'] == 'css') {
            $data = minify_css(run_template(file_get_contents($path)));
            file_put_contents(ROOT . '/public/' . $pathinfo['filename'] . '.min.css', $data);
        }
        if ($pathinfo['extension'] == 'js') {
            $data = minify_js(run_template(file_get_contents($path)));
            file_put_contents(ROOT . '/public/' . $pathinfo['filename'] . '.min.js', $data);
        }
    }
    return 'All resources are compiled successfull';
});
