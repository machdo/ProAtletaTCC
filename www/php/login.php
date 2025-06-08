<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

if (isset($_POST['email'], $_POST['senha'])) {
    $email = $_POST['email'];
    $senha = $_POST['senha'];

    $conn = new mysqli("localhost", "u808148692_proatleta123", "Vini@#07alves", "u808148692_proatleta");

    if ($conn->connect_error) {
        echo json_encode(['success' => false, 'message' => 'Erro de conexão.']);
        exit;
    }

    $stmt = $conn->prepare("SELECT nome, verificado FROM usuarios WHERE email = ? AND senha = ?");
    $stmt->bind_param("ss", $email, $senha);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($nome, $verificado);
        $stmt->fetch();

        if ($verificado == 1) {
            echo json_encode(['success' => true, 'nome' => $nome]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Email ainda não verificado.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Email ou senha inválidos.']);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Parâmetros incompletos.']);
}
?>
