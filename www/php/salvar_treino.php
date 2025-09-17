<?php
// Inicia buffer de saída para evitar qualquer saída indesejada
ob_start();

// Cabeçalhos CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Responde a preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configura log de erros sem exibir no navegador
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Conexão com o banco
$host = "localhost";
$usuario = "u339248760_proatleta1";
$senha = "Vini@#07alves";
$banco = "u339248760_proatleta";

$conn = new mysqli($host, $usuario, $senha, $banco);

if ($conn->connect_error) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Erro na conexão: ' . $conn->connect_error]);
    exit;
}

// Captura parâmetros do POST
$professor_id = $_POST['professor_id'] ?? null;
$email_aluno = $_POST['email_aluno'] ?? null;
$nome_treino = $_POST['nome_treino'] ?? null;
$tipo_treino = $_POST['tipo_treino'] ?? null;
$data_treino = $_POST['data_treino'] ?? null;
$observacoes = $_POST['observacoes'] ?? '';
$exercicios = isset($_POST['exercicios']) ? json_decode($_POST['exercicios'], true) : [];

// Valida parâmetros obrigatórios
if (!$professor_id || !$email_aluno || !$nome_treino) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
    exit;
}

// Valida se o professor_id é numérico
if (!filter_var($professor_id, FILTER_VALIDATE_INT)) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'ID do professor inválido']);
    exit;
}

// Busca o ID do aluno pelo email
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ? AND categoria = 'aluno'");
$stmt->bind_param("s", $email_aluno);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Aluno não encontrado']);
    exit;
}

$aluno = $result->fetch_assoc();
$aluno_id = $aluno['id'];

// Verifica se existe vínculo entre professor e aluno
$stmt = $conn->prepare("SELECT * FROM aluno_professor WHERE Aluno_ID = ? AND Professor_ID = ?");
$stmt->bind_param("ii", $aluno_id, $professor_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Você não tem permissão para criar treinos para este aluno']);
    exit;
}

// Inicia transação
$conn->begin_transaction();

try {
    // Insere o treino na tabela
    $stmt = $conn->prepare("INSERT INTO treinos (professor_id, aluno_id, nome_treino, tipo_treino, data_treino, observacoes, criado_em) VALUES (?, ?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param("iissss", $professor_id, $aluno_id, $nome_treino, $tipo_treino, $data_treino, $observacoes);
    
    if (!$stmt->execute()) {
        throw new Exception("Erro ao salvar treino: " . $stmt->error);
    }
    
    $treino_id = $conn->insert_id;
    
    // Insere os exercícios
    if (!empty($exercicios)) {
        $stmt = $conn->prepare("INSERT INTO exercicios (treino_id, nome, series, repeticoes, descanso, observacoes, ordem) VALUES (?, ?, ?, ?, ?, ?, ?)");
        
        foreach ($exercicios as $index => $exercicio) {
            $ordem = $index + 1;
            $nome_ex = $exercicio['nome'] ?? '';
            $series = $exercicio['series'] ?? 0;
            $repeticoes = $exercicio['repeticoes'] ?? '';
            $descanso = $exercicio['descanso'] ?? 60;
            $obs_ex = $exercicio['observacoes'] ?? '';
            
            $stmt->bind_param("isisisi", $treino_id, $nome_ex, $series, $repeticoes, $descanso, $obs_ex, $ordem);
            
            if (!$stmt->execute()) {
                throw new Exception("Erro ao salvar exercício: " . $stmt->error);
            }
        }
    }
    
    // Confirma a transação
    $conn->commit();
    
    ob_end_clean();
    echo json_encode([
        'success' => true, 
        'message' => 'Treino salvo com sucesso!',
        'treino_id' => $treino_id
    ]);
    
} catch (Exception $e) {
    // Desfaz a transação em caso de erro
    $conn->rollback();
    
    ob_end_clean();
    echo json_encode([
        'success' => false, 
        'message' => 'Erro ao salvar treino: ' . $e->getMessage()
    ]);
}

$conn->close();
?>