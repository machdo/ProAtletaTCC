<?php
// Conexão com o MySQL usando credenciais de config.php (fora do git).
// Copie config.exemplo.php para config.php no servidor e preencha.
function conectar(): mysqli
{
    $config = require __DIR__ . '/config.php';
    mysqli_report(MYSQLI_REPORT_OFF);
    $conn = new mysqli($config['host'], $config['usuario'], $config['senha'], $config['banco']);
    $conn->set_charset('utf8mb4');
    return $conn;
}
