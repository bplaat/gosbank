<?php

if (isset($_SERVER['HTTP_HOST']) && $_SERVER['HTTP_HOST'] == 'gosbank.local') {
    define('APP_DEBUG', true);
} else {
    define('APP_DEBUG', false);
}

define('APP_NAME', 'Gosbank');
define('APP_VERSION', '0.3');
