<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

if (isset($_POST['email'], $_POST['senha'])) {
    $email = $_POST['email'];
    $senha = $_POST['senha'];

    $conn = new mysqli("localhost", "u339248760_proatleta1", "Vini@#07alves", "u339248760_proatleta");

    if ($conn->connect_error) {
        echo json_encode(['success' => false, 'message' => 'Erro de conexão.']);
        exit;
    }

    // Adicionado 'id' na sua consulta SELECT
    $stmt = $conn->prepare("SELECT id, nome, verificado, categoria FROM usuarios WHERE email = BINARY ? AND senha = BINARY ?");
    $stmt->bind_param("ss", $email, $senha);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        // Adicionado $id no bind_result
        $stmt->bind_result($id, $nome, $verificado, $categoria);
        $stmt->fetch();

        if ($verificado == 1) {
            // Retorna nome, categoria E o ID para o front
            echo json_encode([
                'success' => true,
                'id' => $id, // O ID é retornado aqui
                'nome' => $nome,
                'categoria' => $categoria
            ]);
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