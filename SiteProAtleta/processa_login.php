<?php
session_start();

require 'conecta_pro.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $senha_digitada = $_POST['senha']; // Renomeado para maior clareza

    if (empty($email) || empty($senha_digitada)) {
        $_SESSION['erro_login'] = "Por favor, preencha todos os campos.";
        header("Location: login.html");
        exit();
    }

    $stmt = $conn->prepare("SELECT id, nome, email, senha FROM " . DB_TABLE_USERS . " WHERE email = ?");
    if ($stmt === false) {
        $_SESSION['erro_login'] = "Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.";
        header("Location: login.html");
        exit();
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows == 1) {
        $stmt->bind_result($id_usuario, $nome_usuario, $email_usuario, $senha); // Renomeado para clareza
        $stmt->fetch();

        // Passar a senha digitada e o hash armazenado
        if (password_verify($senha_digitada, $senha)) {
            $_SESSION['logado'] = true;
            $_SESSION['id_usuario'] = $id_usuario;
            $_SESSION['nome_usuario'] = $nome_usuario;
            $_SESSION['email_usuario'] = $email_usuario;

            header("Location: dashboard.php");
            exit();
        } else {
            $_SESSION['erro_login'] = "Email ou senha inválidos.";
            header("Location: login.html");
            exit();
        }
    } else {
        $_SESSION['erro_login'] = "Email ou senha inválidos.";
        header("Location: login.html");
        exit();
    }

    $stmt->close();
    $conn->close();

} else {
    $_SESSION['erro_login'] = "Acesso inválido. Por favor, use o formulário de login.";
    header("Location: login.html");
    exit();
}
?>