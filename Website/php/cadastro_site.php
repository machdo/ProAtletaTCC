<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', '0');
require __DIR__ . '/_conexao.php';
header("Access-Control-Allow-Origin: *");

if (isset($_POST['nome'], $_POST['email'], $_POST['senha'])) {
    $nome = $_POST['nome'];
    $email = $_POST['email'];
    $senha = $_POST['senha'];

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'E-mail inválido.']);
        exit;
    }

    $token = bin2hex(random_bytes(16));

    $conn = conectar();

    if ($conn->connect_error) {
        echo json_encode(['success' => false, 'message' => 'Erro de conexão.']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, senha, verificado, token_verificado, foto, categoria) VALUES (?, ?, ?, 0, ?, 'https://proatleta.site/uploads/user.jpg', 'aluno')");
    $stmt->bind_param("ssss", $nome, $email, $senha, $token);

    if ($stmt->execute()) {
        $link = "https://proatleta.site/verificar.php?email=" . urlencode($email) . "&token=$token";
        $mensagem = "Olá $nome,\n\nClique no link abaixo para confirmar seu cadastro:\n$link";
        mail($email, "Confirmação de Cadastro - ProAtleta", $mensagem);

        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao cadastrar.']);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Dados incompletos.']);
}
?>
