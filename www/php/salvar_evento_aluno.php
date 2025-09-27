<?php
// Debug mode
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Log tudo para debug
error_log("=== INICIO SALVAR EVENTO ===");
error_log("Método: " . $_SERVER['REQUEST_METHOD']);

try {
    // Conexão
    $host = "localhost";
    $usuario = "u339248760_proatleta1"; 
    $senha = "Vini@#07alves";
    $banco = "u339248760_proatleta";

    $conn = new mysqli($host, $usuario, $senha, $banco);
    
    if ($conn->connect_error) {
        throw new Exception("Erro conexão: " . $conn->connect_error);
    }
    
    $conn->set_charset("utf8");
    error_log("Conectado ao banco");

    // Verificar POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Só aceita POST');
    }

    // Ler dados JSON
    $input = file_get_contents('php://input');
    error_log("Input recebido: " . $input);
    
    if (empty($input)) {
        throw new Exception('Nenhum dado recebido');
    }

    $data = json_decode($input, true);
    if ($data === null) {
        throw new Exception('JSON inválido: ' . json_last_error_msg());
    }
    
    error_log("Dados decodificados: " . print_r($data, true));

    // Extrair dados
    $aluno_id = $data['aluno_id'] ?? 0;
    $professor_id = $data['professor_id'] ?? 0;
    $titulo = $data['titulo'] ?? '';
    $descricao = $data['descricao'] ?? '';
    $data_evento = $data['data_evento'] ?? '';
    $horario_inicio = $data['horario_inicio'] ?? '';
    $horario_fim = $data['horario_fim'] ?? '';
    $localizacao = $data['local'] ?? ''; // Mapeando 'local' para 'localizacao'
    $tipo = $data['tipo'] ?? 'treino';

    // Validações básicas
    if ($aluno_id <= 0) throw new Exception('ID do aluno obrigatório');
    if ($professor_id <= 0) throw new Exception('ID professor inválido');
    if (empty($titulo)) throw new Exception('Título obrigatório');
    if (empty($data_evento)) throw new Exception('Data obrigatória');
    if (empty($horario_inicio)) throw new Exception('Horário início obrigatório');
    if (empty($horario_fim)) throw new Exception('Horário fim obrigatório');

    error_log("Validações passaram");

    // Tentar inserção SIMPLES primeiro
    $sql = "INSERT INTO agenda_eventos 
            (aluno_id, professor_id, titulo, descricao, data_evento, horario_inicio, horario_fim, localizacao, tipo, status_agenda) 
            VALUES 
            ($aluno_id, $professor_id, '$titulo', '$descricao', '$data_evento', '$horario_inicio', '$horario_fim', '$localizacao', '$tipo', 'ativo')";
    
    error_log("SQL: " . $sql);
    
    if ($conn->query($sql)) {
        $evento_id = $conn->insert_id;
        error_log("Evento inserido com ID: " . $evento_id);
        
        echo json_encode([
            'success' => true,
            'message' => 'Evento salvo com sucesso!',
            'evento_id' => $evento_id
        ]);
    } else {
        throw new Exception("Erro SQL: " . $conn->error);
    }

} catch (Exception $e) {
    error_log("ERRO: " . $e->getMessage());
    error_log("Stack: " . $e->getTraceAsString());
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug' => [
            'input' => isset($input) ? substr($input, 0, 200) : 'vazio',
            'data' => isset($data) ? $data : 'não decodificado'
        ]
    ]);
}

$conn->close();
error_log("=== FIM SALVAR EVENTO ===");
?>