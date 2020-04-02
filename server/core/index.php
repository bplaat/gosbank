<?php

spl_autoload_register(function ($class) {
    $file = ROOT . '/core/' . $class . '.php';
    if (file_exists($file)) require_once $file;
});

require_once ROOT . '/core/view.php';

require_once ROOT . '/config.php';

if (APP_DEBUG) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    require_once ROOT . '/core/debug_routes.php';
}

$files = glob(ROOT . '/routes/*');
foreach ($files as $file) {
    if (is_file($file)) {
        require_once $file;
    }
}
