<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if (!isset($_GET['email'])) {
    echo json_encode(['success' => false, 'message' => 'Email não informado']);
    exit;
}

$host = "localhost";
$usuario = "u339248760_proatleta1";
$senha = "Vini@#07alves";
$banco = "u339248760_proatleta";

$email = $_GET['email'];

// conexão com o banco (use as credenciais corretas)
$pdo = new PDO("mysql:host=$host;dbname=$banco;charset=utf8", $usuario, $senha);

$stmt = $pdo->prepare("SELECT nome, email, foto FROM usuarios WHERE email = ?");
$stmt->execute([$email]);
$usuario = $stmt->fetch(PDO::FETCH_ASSOC);

if ($usuario) {
    echo json_encode(['success' => true, 'usuario' => $usuario]);
} else {
    echo json_encode(['success' => false, 'message' => 'Usuário não encontrado']);
}
?>