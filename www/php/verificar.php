<?php
if (isset($_GET['token'])) {
    $token = $_GET['token'];

    $conn = new mysqli("localhost", "u808148692_proatleta123", "Vini@#07alves", "u808148692_proatleta");

    if ($conn->connect_error) {
        die("Erro de conexão: " . $conn->connect_error);
    }

    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE token = ? AND verificado = 0");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $update = $conn->prepare("UPDATE usuarios SET verificado = 1 WHERE token = ?");
        $update->bind_param("s", $token);
        $update->execute();
        echo "✅ E-mail verificado com sucesso! Agora você já pode fazer login.";
    } else {
        echo "❌ Link inválido ou e-mail já verificado.";
    }

    $stmt->close();
    $conn->close();
} else {
    echo "❌ Token não fornecido.";
}
?>
