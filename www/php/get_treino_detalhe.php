<?php
// Cabeçalhos CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Responde a preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Conexão com o banco
$host = "localhost";
$usuario = "u339248760_proatleta1";
$senha = "Vini@#07alves";
$banco = "u339248760_proatleta";

$conn = new mysqli($host, $usuario, $senha, $banco);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Falha na conexão: " . $conn->connect_error]);
    exit;
}

// Pega os parâmetros
$treino_id = isset($_GET['treino_id']) ? intval($_GET['treino_id']) : 0;
$email_aluno = $_GET['email_aluno'] ?? '';

if ($treino_id <= 0) {
    echo json_encode(["success" => false, "message" => "ID do treino inválido"]);
    exit;
}

// Busca o ID do aluno pelo email (para validação)
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ? AND categoria = 'aluno'");
$stmt->bind_param("s", $email_aluno);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    echo json_encode(["success" => false, "message" => "Aluno não encontrado"]);
    exit;
}

$aluno = $result->fetch_assoc();
$aluno_id = $aluno['id'];

// Busca o treino específico
$sql = "SELECT t.*, u.nome as professor_nome 
        FROM treinos t
        INNER JOIN usuarios u ON t.professor_id = u.id
        WHERE t.id = ? AND t.aluno_id = ? AND t.ativo = 1";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $treino_id, $aluno_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    echo json_encode(["success" => false, "message" => "Treino não encontrado ou sem permissão"]);
    exit;
}

$treino = $result->fetch_assoc();

// Busca os exercícios do treino
$stmt_ex = $conn->prepare("SELECT * FROM exercicios WHERE treino_id = ? ORDER BY ordem ASC");
$stmt_ex->bind_param("i", $treino_id);
$stmt_ex->execute();
$result_ex = $stmt_ex->get_result();

$exercicios = [];
while ($ex = $result_ex->fetch_assoc()) {
    $exercicios[] = [
        'id' => $ex['id'],
        'nome' => $ex['nome'],
        'series' => $ex['series'],
        'repeticoes' => $ex['repeticoes'],
        'descanso' => $ex['descanso'],
        'observacoes' => $ex['observacoes'],
        'ordem' => $ex['ordem']
    ];
}

// Monta resposta completa
$resposta = [
    'id' => $treino['id'],
    'nome_treino' => $treino['nome_treino'],
    'tipo_treino' => $treino['tipo_treino'],
    'data_treino' => $treino['data_treino'],
    'observacoes' => $treino['observacoes'],
    'professor_nome' => $treino['professor_nome'],
    'criado_em' => $treino['criado_em'],
    'exercicios' => $exercicios,
    'total_exercicios' => count($exercicios)
];

echo json_encode([
    "success" => true,
    "treino" => $resposta
]);

$stmt->close();
$stmt_ex->close();
$conn->close();
?>