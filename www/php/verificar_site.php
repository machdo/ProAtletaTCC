<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Carrega as classes do PHPMailer
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';
require 'PHPMailer/Exception.php';

if (isset($_GET['email'], $_GET['token'])) {
    $email = $_GET['email'];
    $token = $_GET['token'];

    $conn = new mysqli("localhost", "u339248760_proatleta1", "Vini@#07alves", "u339248760_proatleta");

    if ($conn->connect_error) {
        die("Erro de conexão.");
    }

    $stmt = $conn->prepare("SELECT id, nome FROM usuarios WHERE email = ? AND token_verificado = ?");
    $stmt->bind_param("ss", $email, $token);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($id, $nome);
        $stmt->fetch();

        $update = $conn->prepare("UPDATE usuarios SET verificado = 1 WHERE email = ?");
        $update->bind_param("s", $email);
        $update->execute();

        // Envia um e-mail de confirmação
        $mail = new PHPMailer(true);
        $mail->CharSet = 'UTF-8';

        try {
            $mail->isSMTP();
            $mail->Host = 'smtp.hostinger.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'contato@proatleta.site'; // Seu email criado na Hostinger
            $mail->Password = 'Vini@#07alves';          // A senha desse email
            $mail->SMTPSecure = 'ssl';                  // Use 'tls' se usar porta 587
            $mail->Port = 465;                          // 587 se usar 'tls'

            $mail->setFrom('contato@proatleta.site', 'ProAtleta');
            $mail->addAddress($email, $nome);

            $mail->isHTML(true);
            $mail->Subject = 'Conta Verificada - ProAtleta';
            $mail->Body = "Olá $nome,<br><br>Sua conta foi verificada com sucesso! Você já pode fazer login no sistema.";

            $mail->send();
            echo "Email verificado com sucesso! Você já pode fazer login.";
        } catch (Exception $e) {
            echo "Email verificado, mas ocorreu um erro ao enviar o e-mail de confirmação: {$mail->ErrorInfo}";
        }
    } else {
        echo "Token inválido ou já verificado.";
    }

    $stmt->close();
    $conn->close();
} else {
    echo "Parâmetros ausentes.";
}
?>