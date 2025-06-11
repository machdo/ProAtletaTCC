<?php
session_start();

require 'conecta_pro.php'; 

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $nome = htmlspecialchars(trim($_POST['nome']));
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $senha_digitada = $_POST['senha']; 
    

    if (empty($nome) || empty($email) || empty($senha_digitada)) {
        $_SESSION['erro_cadastro'] = "Por favor, preencha todos os campos.";
        header("Location: cadastro.html");
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $_SESSION['erro_cadastro'] = "Formato de e-mail inválido.";
        header("Location: cadastro.html");
        exit();
    }

    // Removido: $senha_para_db = password_hash($senha_digitada, PASSWORD_DEFAULT);
    // IMPORTANTE: Isso significa que $senha_digitada (texto puro) será armazenada diretamente.
    // E isso ainda tem o problema de VARCHAR(30) truncar senhas longas.


   
    $stmt_check = $conn->prepare("SELECT id FROM " . DB_TABLE_USERS . " WHERE email = ?"); 
    if ($stmt_check === false) {
        $_SESSION['erro_cadastro'] = "Erro interno na preparação da consulta de verificação de e-mail.";
        header("Location: cadastro.html");
        exit();
    }
    $stmt_check->bind_param("s", $email);
    $stmt_check->execute();
    $stmt_check->store_result();

    if ($stmt_check->num_rows > 0) {
        $_SESSION['erro_cadastro'] = "Este e-mail já está cadastrado.";
        header("Location: cadastro.html");
        exit();
    }
    $stmt_check->close();


    $stmt_insert = $conn->prepare("INSERT INTO " . DB_TABLE_USERS . " (nome, email, senha) VALUES (?, ?, ?)"); 
    if ($stmt_insert === false) {
        $_SESSION['erro_cadastro'] = "Erro interno na preparação da consulta de inserção.";
        header("Location: cadastro.html");
        exit();
    }

    $stmt_insert->bind_param("sss", $nome, $email, $senha_digitada); 

    if ($stmt_insert->execute()) {
        $_SESSION['sucesso_cadastro'] = "Cadastro realizado com sucesso! Agora você pode fazer login.";
        header("Location: login.html");
        exit();
    } else {
        $_SESSION['erro_cadastro'] = "Erro ao cadastrar: " . $stmt_insert->error;
        header("Location: cadastro.html");
        exit();
    }

    $stmt_insert->close();
    $conn->close();

} else {

    $_SESSION['erro_cadastro'] = "Acesso inválido. Por favor, use o formulário de cadastro.";
    header("Location: cadastro.html");
    exit();
}
?>