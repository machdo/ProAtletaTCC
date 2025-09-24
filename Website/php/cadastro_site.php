<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");

if (isset($_POST['nome'], $_POST['email'], $_POST['senha'])) {
    $nome = $_POST['nome'];
    $email = $_POST['email'];
    $senha = $_POST['senha'];

    $token = bin2hex(random_bytes(16));

    $conn = new mysqli("localhost", "u339248760_proatleta1", "Vini@#07alves", "u339248760_proatleta");

    if ($conn->connect_error) {
        echo json_encode(['success' => false, 'message' => 'Erro de conexão.']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, senha, verificado, token_verificado, foto, categoria) VALUES (?, ?, ?, 0, ?, 'https://proatleta.site/uploads/user.jpg', 'aluno')");
    $stmt->bind_param("ssss", $nome, $email, $senha, $token);

    if ($stmt->execute()) {
        $link = "https://proatleta.site/verificar.php?email=$email&token=$token";
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
