<?php
$conn = new mysqli("localhost", "root", "", "pro_atleta");
if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
}

define('DB_TABLE_USERS', 'usuarios'); 
   
$conn->set_charset("utf8mb4");

?>