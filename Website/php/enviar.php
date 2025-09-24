<?php
if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $nome = htmlspecialchars($_POST['nome']);
    $email = htmlspecialchars($_POST['email']);
    $celular = htmlspecialchars($_POST['celular']);
    $mensagem = htmlspecialchars($_POST['mensagem']);

    $to = "proatleta1@gmail.com";
    $subject = "Nova mensagem do formulário Fale Conosco";
    $body = "Nome: $nome\nEmail: $email\nCelular: $celular\nMensagem:\n$mensagem";
    $headers = "From: $email";

    if(mail($to, $subject, $body, $headers)){
        echo "Mensagem enviada com sucesso!";
    } else {
        echo "Erro ao enviar mensagem.";
    }
} else {
    echo "Método inválido.";
}
?>
