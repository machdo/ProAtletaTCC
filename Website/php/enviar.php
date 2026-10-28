<?php
// Formulário "Fale conosco" do site.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo "Método inválido.";
    exit;
}

$nome = trim(strip_tags($_POST['nome'] ?? ''));
$email = trim($_POST['email'] ?? '');
$celular = trim(strip_tags($_POST['celular'] ?? ''));
$mensagem = trim(strip_tags($_POST['mensagem'] ?? ''));

if ($nome === '' || $mensagem === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo "Confira nome, e-mail e mensagem e tente de novo.";
    exit;
}

// O e-mail do visitante vai em Reply-To, nunca em From: assim ninguém injeta cabeçalhos
// e o provedor não marca a mensagem como falsificada.
$nome = str_replace(["\r", "\n"], ' ', $nome);
$to = "proatleta1@gmail.com";
$subject = "Nova mensagem do formulário Fale Conosco";
$body = "Nome: $nome\nEmail: $email\nCelular: $celular\nMensagem:\n$mensagem";
$headers = "From: ProAtleta <nao-responda@proatleta.site>\r\nReply-To: $email";

if (mail($to, $subject, $body, $headers)) {
    echo "Mensagem enviada! Respondemos pelo seu e-mail.";
} else {
    echo "Não conseguimos enviar agora. Tente de novo em alguns minutos ou escreva para proatleta1@gmail.com.";
}
