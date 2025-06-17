<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");

if (isset($_POST['nome'], $_POST['email'], $_POST['senha'])) {
    $nome = $_POST['nome'];
    $email = $_POST['email'];
    $senha = $_POST['senha'];

    $token = bin2hex(random_bytes(16)); // Gera token aleatório

    $conn = new mysqli("localhost", "u579644408_proatleta1", "Vini@#07alves", "u579644408_proatleta");

    if ($conn->connect_error) {
        echo json_encode(['success' => false, 'message' => 'Erro de conexão.']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, senha, token_verificado, verificado) VALUES (?, ?, ?, ?, 0)");
    $stmt->bind_param("ssss", $nome, $email, $senha, $token);


    if ($stmt->execute()) {
        // Envia o e-mail
        $link = "https://proesportes.shop/verificar.php?email=$email&token=$token";
        $mensagem = "Olá $nome,\n\nClique no link abaixo para confirmar seu cadastro:\n$link";
        mail($email, "Confirmação de Cadastro - ProAtleta", $mensagem);

        echo json_encode(['success' => true, 'message' => 'Cadastro realizado! Verifique seu e-mail.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao cadastrar.']);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Dados incompletos.']);
}
?>