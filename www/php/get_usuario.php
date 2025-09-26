<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if (!isset($_GET['email']) && !isset($_GET['id'])) {
    echo json_encode(['success' => false, 'message' => 'Email ou ID não informado']);
    exit;
}

$host = "localhost";
$usuario = "u339248760_proatleta1";
$senha = "Vini@#07alves";
$banco = "u339248760_proatleta";

// conexão com o banco (use as credenciais corretas)
$pdo = new PDO("mysql:host=$host;dbname=$banco;charset=utf8", $usuario, $senha);

if (isset($_GET['email'])) {
    $email = $_GET['email'];
    $stmt = $pdo->prepare("SELECT id, nome, email, foto FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
} else {
    $id = intval($_GET['id']);
    $stmt = $pdo->prepare("SELECT id, nome, email, foto FROM usuarios WHERE id = ?");
    $stmt->execute([$id]);
}

$usuario = $stmt->fetch(PDO::FETCH_ASSOC);

if ($usuario) {
    echo json_encode(['success' => true, 'usuario' => $usuario]);
} else {
    echo json_encode(['success' => false, 'message' => 'Usuário não encontrado']);
}
?>