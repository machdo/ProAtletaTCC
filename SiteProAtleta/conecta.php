<?php
$conexao = new mysqli("localhost", "root", "", "pro_ateta");
if ($conexao->connect_error) {
    die("Conexão falhou: " . $conexao->connect_error);
}
?>