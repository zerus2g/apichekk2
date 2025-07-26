<?php
header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'status' => 'success',
    'message' => 'PHP API đang hoạt động!',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => PHP_VERSION,
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
]);
?> 