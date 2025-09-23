<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$host = "localhost";
$usuario = "u339248760_proatleta1";
$senha = "Vini@#07alves";
$banco = "u339248760_proatleta";

$conn = new mysqli($host, $usuario, $senha, $banco);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Falha na conexão: " . $conn->connect_error]);
    exit;
}

// Captura o ID do professor
$profId = 0;
if (isset($_POST['profId'])) {
    $profId = intval($_POST['profId']);
} elseif (isset($_GET['id'])) {
    $profId = intval($_GET['id']);
} elseif (isset($_GET['profId'])) {
    $profId = intval($_GET['profId']);
}

if ($profId <= 0) {
    echo json_encode(["success" => false, "message" => "ID do professor inválido"]);
    exit;
}

// Consulta para buscar os alunos associados
$sql = "SELECT u.id, u.nome as nome_aluno, u.email, u.foto as foto
        FROM usuarios u
        INNER JOIN aluno_professor a ON a.Aluno_ID = u.id
        WHERE a.Professor_ID = ? AND u.categoria = 'aluno'";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Erro ao preparar query"]);
    $conn->close();
    exit;
}

$stmt->bind_param("i", $profId);
$stmt->execute();
$result = $stmt->get_result();

$alunos = [];
while ($row = $result->fetch_assoc()) {
    $alunos[] = $row;
}

echo json_encode([
    "success" => true,
    "alunos" => $alunos
]);

$stmt->close();
$conn->close();
?>