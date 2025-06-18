<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if (!isset($_GET['email'])) {
    echo json_encode(['success' => false, 'message' => 'Email não informado']);
    exit;
}

$host = 'localhost';
$db = 'u579644408_proatleta';
$user = 'u579644408_proatleta1';
$pass = 'Vini@#07alves';

$email = $_GET['email'];

// conexão com o banco (use as credenciais corretas)
$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);

$stmt = $pdo->prepare("SELECT nome, email, foto FROM usuarios WHERE email = ?");
$stmt->execute([$email]);
$usuario = $stmt->fetch(PDO::FETCH_ASSOC);

if ($usuario) {
    echo json_encode(['success' => true, 'usuario' => $usuario]);
} else {
    echo json_encode(['success' => false, 'message' => 'Usuário não encontrado']);
}
?>