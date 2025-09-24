<?php 
if (isset($_GET['email'], $_GET['token'])) {
    $email = $_GET['email'];
    $token = $_GET['token'];

    $conn = new mysqli("localhost", "u339248760_proatleta1", "Vini@#07alves", "u339248760_proatleta");

    if ($conn->connect_error) {
        die("Erro de conexão.");
    }

    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ? AND token_verificado = ?");
    $stmt->bind_param("ss", $email, $token);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $update = $conn->prepare("UPDATE usuarios SET verificado = 1 WHERE email = ?");
        $update->bind_param("s", $email);
        $update->execute();
        echo "Email verificado com sucesso! Você já pode fazer login.";
    } else {
        echo "Token inválido ou já verificado.";
    }

    $stmt->close();
    $conn->close();
} else {
    echo "Parâmetros ausentes.";
}
?>
