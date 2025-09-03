<?php
header("Content-Type: application/json; charset=UTF-8");

$host   = "localhost";
$usuario = "u339248760_proatleta1";
$senha   = "Vini@#07alves";
$banco   = "u339248760_proatleta";

$conn = new mysqli($host, $usuario, $senha, $banco);

if ($conn->connect_error) {
    die(json_encode(["error" => "Falha na conexão: " . $conn->connect_error]));
}

$idSolicitacao = isset($_POST['id']) ? intval($_POST['id']) : 0;

$sql = "SELECT ID_aluno, ID_professor FROM solicitacoes_professor WHERE ID = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $idSolicitacao);
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_assoc();

if ($data) {
    $aluno     = $data['ID_aluno'];
    $professor = $data['ID_professor'];

    // insere vínculo
    $insert = $conn->prepare("INSERT INTO aluno_professor (Aluno_ID, Professor_ID) VALUES (?, ?)");
    $insert->bind_param("ii", $aluno, $professor);
    $insert->execute();

    // atualiza status
    $update = $conn->prepare("UPDATE solicitacoes_professor SET status = 'aceito' WHERE ID = ?");
    $update->bind_param("i", $idSolicitacao);
    $update->execute();

    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false]);
}

$conn->close();
