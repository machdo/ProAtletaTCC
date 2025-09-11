<?php
// get_solicitacoes.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// responde a preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$host    = "localhost";
$usuario = "u339248760_proatleta1";
$senha   = "Vini@#07alves";
$banco   = "u339248760_proatleta";

$conn = new mysqli($host, $usuario, $senha, $banco);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Falha na conexão: " . $conn->connect_error]);
    exit;
}

// aceita tanto POST (alunoId) quanto GET (id ou alunoId)
$alunoId = 0;
if (isset($_POST['alunoId'])) {
    $alunoId = intval($_POST['alunoId']);
} elseif (isset($_GET['id'])) {
    $alunoId = intval($_GET['id']);
} elseif (isset($_GET['alunoId'])) {
    $alunoId = intval($_GET['alunoId']);
}

// Se quiser forçar debug, descomente a linha a seguir:
// error_log("get_solicitacoes.php -> alunoId: $alunoId");

$sql = "SELECT s.ID, u.email as email_professor, s.status 
        FROM solicitacoes_professor s
        JOIN usuarios u ON s.ID_professor = u.id
        WHERE s.ID_aluno = ? AND s.status = 'pendente'";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Erro ao preparar query"]);
    $conn->close();
    exit;
}

$stmt->bind_param("i", $alunoId);
$stmt->execute();
$result = $stmt->get_result();

$solicitacoes = [];
while ($row = $result->fetch_assoc()) {
    $solicitacoes[] = $row;
}

echo json_encode([
    "success" => true,
    "solicitacoes" => $solicitacoes
]);

$stmt->close();
$conn->close();
?>
