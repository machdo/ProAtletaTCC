<?php
header('Content-Type: application/json');

try {
    $host = "localhost";
    $usuario = "u339248760_proatleta1";
    $senha = "Vini@#07alves";
    $banco = "u339248760_proatleta";

    $conn = new mysqli($host, $usuario, $senha, $banco);

    if ($conn->connect_error) {
        throw new Exception("Conexão falhou: " . $conn->connect_error);
    }

    $conn->set_charset("utf8");

    // Testar se consegue inserir um registro simples
    $sql = "INSERT INTO agenda_eventos (aluno_email, professor_id, titulo, data_evento, horario_inicio, horario_fim, tipo, status_agenda) 
            VALUES ('teste@teste.com', 1, 'Teste', '2024-01-01', '10:00', '11:00', 'treino', 'ativo')";
    
    if ($conn->query($sql)) {
        echo json_encode([
            'success' => true,
            'message' => 'Teste de inserção OK',
            'last_id' => $conn->insert_id
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Erro na inserção: ' . $conn->error
        ]);
    }

    $conn->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>