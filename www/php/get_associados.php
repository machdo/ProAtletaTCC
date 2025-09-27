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

// Captura o ID do aluno
$alunoId = 0;
if (isset($_POST['alunoId'])) {
    $alunoId = intval($_POST['alunoId']);
} elseif (isset($_GET['id'])) {
    $alunoId = intval($_GET['id']);
} elseif (isset($_GET['alunoId'])) {
    $alunoId = intval($_GET['alunoId']);
}

if ($alunoId <= 0) {
    echo json_encode(["success" => false, "message" => "ID do aluno inválido"]);
    exit;
}

// Consulta para buscar os professores associados
$sql = "SELECT u.id, u.nome as nome_prof, u.email, u.foto as foto
        FROM usuarios u
        INNER JOIN aluno_professor a ON a.Professor_ID = u.id
        WHERE a.Aluno_ID = ? AND u.categoria = 'prof'";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Erro ao preparar query"]);
    $conn->close();
    exit;
}

$stmt->bind_param("i", $alunoId);
$stmt->execute();
$result = $stmt->get_result();

$professores = [];
while ($row = $result->fetch_assoc()) {
    $professores[] = $row;
}

echo json_encode([
    "success" => true,
    "professores" => $professores
]);

$stmt->close();
$conn->close();
?>
