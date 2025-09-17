<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Carrega as classes do PHPMailer
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';
require 'PHPMailer/Exception.php';

if (isset($_POST['nome'], $_POST['email'], $_POST['senha'], $_POST['categoria'])) {
    $nome = $_POST['nome'];
    $email = $_POST['email'];
    $senha = $_POST['senha'];
    $categoria = $_POST['categoria'];

    $token = bin2hex(random_bytes(16)); // Gera token aleatório

    $conn = new mysqli("localhost", "u339248760_proatleta1", "Vini@#07alves", "u339248760_proatleta");

    if ($conn->connect_error) {
        echo json_encode(['success' => false, 'message' => 'Erro de conexão.']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, senha, token_verificado, verificado, categoria) VALUES (?, ?, ?, ?, 0, ?)");
    $stmt->bind_param("sssss", $nome, $email, $senha, $token, $categoria);

    if ($stmt->execute()) {
        // Configura o PHPMailer
        $mail = new PHPMailer(true);
        $mail->CharSet = 'UTF-8';

        try {
            $mail->isSMTP();
            $mail->Host = 'smtp.hostinger.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'contato@proatleta.site'; // Seu email criado na Hostinger
            $mail->Password = 'Vini@#07alves';             // A senha desse email
            $mail->SMTPSecure = 'ssl';                      // Use 'tls' se usar porta 587
            $mail->Port = 465;                              // 587 se usar 'tls'

            $mail->setFrom('contato@proatleta.site', 'ProAtleta');
            $mail->addAddress($email, $nome);

            $mail->isHTML(true);
            $mail->Subject = 'Confirmação de Cadastro - ProAtleta';
            $link = "https://proatleta.site/verificar.php?email=$email&token=$token";
            $mail->Body = "Olá $nome,<br><br>Clique no link abaixo para confirmar seu cadastro:<br><a href='$link'>$link</a>";

            $mail->send();
            echo json_encode(['success' => true, 'message' => 'Cadastro realizado! Verifique seu e-mail.']);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => "Erro ao enviar e-mail: {$mail->ErrorInfo}"]);
        }

    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao cadastrar.']);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Dados incompletos.']);
}
